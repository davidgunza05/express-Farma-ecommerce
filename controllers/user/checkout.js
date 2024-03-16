const { default: mongoose, mongo, Mongoose } = require("mongoose");
const cartCLTN = require("../../models/user/cart");
const productCLTN = require("../../models/admin/product")
const userCLTN = require("../../models/user/details");
const couponCLTN = require("../../models/admin/coupons");
const orderCLTN = require("../../models/user/orders");
const paypal = require("paypal-rest-sdk");
const Categoria = require("../../models/admin/category");
const qrcode = require('qrcode');

// Paypal Configuration ship
paypal.configure({
  mode: "sandbox", //sandbox or live 
  client_id: process.env.PAYPAL_CLIENTID,
  client_secret: process.env.PAYPAL_SECRET,
});

exports.view = async (req, res) => {
  try {
    const currentUser = await userCLTN.findById(req.session.userID);

    // Products in cart
    const userCart = await cartCLTN
      .findOne({
        customer: req.session.userID,
      })
      .populate("products.name");
    const products = userCart.products;
    if (userCart.totalQuantity != 0) {
      // All Address
      let allAddresses = await userCLTN.findById(req.session.userID);
      allAddresses = allAddresses.addresses;

      // Default Address
      let defaultAddress = await userCLTN.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(req.session.userID) },
        },
        {
          $unwind: "$addresses",
        },
        {
          $match: {
            "addresses.primary": true,
          },
        },
        {
          $project: {
            address: "$addresses",
          },
        },
      ]);
      if (defaultAddress != "") {
        defaultAddress = defaultAddress[0].address;
      } else {
        defaultAddress = 0;
      }
      const userID = req.session.userID;
      const currentUser = await userCLTN.findById(userID);
      const categories = await Categoria.find({}); 
      // Rendering
      res.render("user/profile/partials/checkout", {
        defaultAddress,
        products,
        userCart,
        allAddresses,
        documentTitle: "Checkout",
        details: categories,
        currentUser,
        session: req.session.userID,
      });
    } else {
      res.redirect("/users/cart");
    }
  } catch (error) {
    console.log("Error rendering checkout page: " + error);
  }
};

exports.coupon = async (req, res) => {
  try {
    const couponCode = req.body.couponCode;
    const userCart = await cartCLTN.findOne({
      customer: req.session.userID,
    });
    const cartPrice = userCart.totalPrice;
    if (couponCode == "") {
      res.json({
        data: {
          couponCheck: null,
          discountPrice: 0,
          discountPercentage: 0,
          finalPrice: userCart.totalPrice,
        },
      });
    } else {
      const coupon = await couponCLTN.findOne({
        code: couponCode,
      });
      let discountPercentage = 0;
      let discountPrice = 0;
      let finalPrice = cartPrice;
      if (coupon) {
        const alreadyUsedCoupon = await userCLTN.findOne({
          _id: req.session.userID,
          couponsUsed: coupon._id,
        });
        if (!alreadyUsedCoupon) {
          if (coupon.active == true) {
            const currentTime = new Date().toJSON();
            if (currentTime > coupon.startingDate.toJSON()) {
              if (currentTime < coupon.expiryDate.toJSON()) {
                discountPercentage = coupon.discount;
                discountPrice = (discountPercentage / 100) * cartPrice;
                discountPrice = Math.floor(discountPrice)
                finalPrice = cartPrice - discountPrice;
                couponCheck =
                  '<b>Desconto aplicado <i class="fa fa-check text-success" aria-hidden="true"></i></b></br>' +
                  coupon.name;
              } else {
                couponCheck =
                  "<b style='font-size:0.75rem; color: red'>Desconto expirado<i class='fa fa-stopwatch'></i></b>";
              }
            } else {
              couponCheck = `<b style='font-size:0.75rem; color: green'>Desconto começa em </b><br/><p style="font-size:0.75rem;">${coupon.startingDate}</p>`;
            }
          } else {
            couponCheck =
              "<b style='font-size:0.75rem; color: red'>Desconto inválido !</i></b>";
          }
        } else {
          couponCheck =
            "<b style='font-size:0.75rem; color: grey'>Desconto já usado !</i></b>";
        }
      } else {
        couponCheck = "<b style='font-size:0.75rem'>Desconto não encontrado</b>";
      }
      res.json({
        data: {
          couponCheck,
          discountPrice,
          discountPercentage,
          finalPrice,
        },
      });
    }
  } catch (error) {
    console.log("Error checking coupon: " + error);
  }
};

exports.defaultAddress = async (req, res) => {
  try {
    const userID = req.session.userID;
    const DefaultAddress = req.body.DefaultAddress;
    await userCLTN.updateMany(
      { _id: userID, "addresses.primary": true },
      { $set: { "addresses.$.primary": false } }
    );
    await userCLTN.updateOne(
      { _id: userID, "addresses._id": DefaultAddress },
      { $set: { "addresses.$.primary": true } }
    );
    res.redirect("/users/cart/checkout");
  } catch (error) {
    console.log("Error at checkout page changing default address: " + error);
  }
};


let orderDetails;
exports.checkout = async (req, res) => {
  try {
    // Shipping Address
    let shippingAddress = await userCLTN.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.session.userID),
        },
      },
      {
        $unwind: "$addresses",
      },
      {
        $match: {
          "addresses._id": mongoose.Types.ObjectId(req.body.addressID),
        },
      },
    ]);
    shippingAddress = shippingAddress[0].addresses;

    // Coupon used if any
    couponUsed = await couponCLTN.findOne({
      code: req.body.couponCode,
      active: true,
    });

    if (couponUsed) {
      const currentTime = new Date().toJSON();
      if (currentTime > couponUsed.startingDate.toJSON()) {
        if (currentTime < couponUsed.expiryDate.toJSON()) {
          couponUsed = couponUsed._id;
        } else {
          req.body.couponDiscount = 0;
        }
      } else {
        req.body.couponDiscount = 0;
      }
    } else {
      req.body.couponDiscount = 0;
    }
    if (!req.body.couponDiscount) {
      req.body.couponDiscount = 0;
      couponUsed = null;
    }
    req.session.couponUsed = couponUsed;
    // Cart summary
    const orderSummary = await cartCLTN.aggregate([
      {
        $match: {
          customer: mongoose.Types.ObjectId(req.session.userID),
        },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          _id: 0,
          product: "$products.name",
          quantity: "$products.quantity",
          totalPrice: "$products.price",
        },
      },
    ]);
    const userCart = await cartCLTN.findOne({
      customer: req.session.userID,
    });

    
    for (const item of userCart.products) {
      const product = await productCLTN.findById(item.name._id);
      if (product.stock < item.quantity) {
        // If any item is out of stock, redirect to the cart page with an error message
        req.flash('error_msg', 'Não existe quantidade suficiente em stock deste produto, tente quantidade menor')
        return res.redirect("/users/cart");
        console.log("error", `${item.name.name} is out of stock.`);
        if(product.stock ==0){
          req.flash('error_msg', 'Stock do produto esgotado')
          return res.redirect("/users/cart");
      }
      } else{
        product.stock -= item.quantity;
        await product.save();
      }
    }

    

    // Creating order
    orderDetails = {
      customer: req.session.userID,
      shippingAddress: {
        provincia: shippingAddress.provincia,
        municipio: shippingAddress.municipio,
        predio: shippingAddress.predio,
        email: shippingAddress.email,
        nome: shippingAddress.nome,
        bairro: shippingAddress.bairro,
        pincode: shippingAddress.pincode,
        contacto: shippingAddress.contacto,
      },
      modeOfPayment: req.body.paymentMethod,
      couponUsed: couponUsed,
      summary: orderSummary,
      totalQuantity: userCart.totalQuantity,
      price: userCart.totalPrice,
      finalPrice: req.body.finalPrice,
      discountPrice: req.body.couponDiscount,
    };
    req.session.orderDetails = orderDetails;
    const transactionID = Math.floor(
      Math.random() * (1000000000000 - 10000000000) + 10000000000
    );
    req.session.transactionID = transactionID;
    if (req.body.paymentMethod === "Pagamento na entrega") {
      res.redirect("/users/cart/checkout/" + transactionID);
    } else if (req.body.paymentMethod === "PayPal") {
      const billAmount = orderDetails.finalPrice * 0.012;
      const create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: `http://localhost:3000/users/cart/checkout/${transactionID}`,
          cancel_url: "http://localhost:3000/users/cart/checkout",
          
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: `Order Number-${transactionID}`,
                  sku: `Order Number-${transactionID}`,
                  price: billAmount,
                  currency: "USD",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "USD",
              total: billAmount,
            },
            description: "e-Farma",
          },
        ],
      };
      paypal.payment.create(
        create_payment_json,
        async function (error, payment) {
          if (error) {
            throw error;
          } else {
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === "approval_url") {
                res.redirect(payment.links[i].href);
              }
            }
          }
        }
      );
    }
  } catch (error) {
    console.log("Error checking out: " + error);
  }
};

exports.result = async (req, res) => {
  try {
    if (req.session.transactionID) {
      const couponUsed = req.session.couponUsed;
      req.session.transactionID = false;

      const orderDetails = new orderCLTN(req.session.orderDetails);
      orderDetails.save();

          // Generar el código QR único utilizando el ID del pedido
      const qrCodeData = `http://localhost:3000/users/orders/${orderDetails._id}`;
      const qrCodeOptions = {
        type: 'svg',
      };
      const qrCode = await qrcode.toString(qrCodeData, qrCodeOptions);

      if (couponUsed) {
        await userCLTN.findByIdAndUpdate(req.session.userID, {
          $push: {
            orders: [mongoose.Types.ObjectId(orderDetails)],
            couponsUsed: [couponUsed],
          },
        });  
      } else {
        await userCLTN.findByIdAndUpdate(req.session.userID, {
          $push: {
            orders: [mongoose.Types.ObjectId(orderDetails)],
          },
        });
      }
      await cartCLTN.findOneAndUpdate(
        {
          customer: req.session.userID,
        },
        {
          $set: { products: [], totalPrice: 0, totalQuantity: 0 },
        }
      );
      const userID = req.session.userID;
      const currentUser = await userCLTN.findById(userID);

      const orderResult = "Pedido efetuado";
      const categories = await Categoria.find({}); 
      res.render("user/profile/partials/orderResult", {
        documentTitle: orderResult,
        details: categories,
        orderID: orderDetails._id,
        currentUser,
        session: req.session.userID,
        qrCode, // Adicionar o código QR ao objeto de dados
      });
    } else {
      res.redirect("/users/cart/checkout/");
    }
  } catch (error) {
    console.log("Erro ao renderizar página de sucesso: " + error);
  }
};
