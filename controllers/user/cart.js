const { default: mongoose } = require("mongoose");
const cartCLTN = require("../../models/user/cart");
const productCLTN = require("../../models/admin/product");
const wishlistCLTN = require("../../models/user/wishlist");
const UserCLTN = require("../../models/user/details");
const Categoria = require("../../models/admin/category");

exports.viewAll = async (req, res) => {
  try {
    const userID = req.session.userID;
    const currentUser = await UserCLTN.findById(userID); 
    const userCart = await cartCLTN
      .findOne({ customer: req.session.userID })
      .populate("products.name");
      const categories = await Categoria.find({}); 
    res.render("user/profile/partials/cart", {
      userCart,
      details: categories,
      session: req.session.userID,
      documentTitle: "Meu carrinho",
      currentUser,
    });
  } catch (error) {
    console.log("Erro ao renderizar todos endereços: " + error);
  }
};

exports.addToCart = async (req, res) => {
  try {
    const wishlistCheck = await wishlistCLTN.findOne({
      customer: req.session.userID,
      products: mongoose.Types.ObjectId(req.body.id),
    });
    if (wishlistCheck) {
      await wishlistCLTN.findByIdAndUpdate(wishlistCheck._id, {
        $pull: {
          products: req.body.id,
        },
      });
    }
    const userCart = await cartCLTN.findOne({ customer: req.session.userID });
    const product = await productCLTN.findById(req.body.id);
    const productExist = await cartCLTN.findOne({
      _id: userCart._id,
      products: {
        $elemMatch: { name: mongoose.Types.ObjectId(req.body.id) },
      },
    });
    if (productExist) {
      await cartCLTN.updateOne(
        {
          _id: userCart._id,
          products: {
            $elemMatch: { name: mongoose.Types.ObjectId(req.body.id) },
          },
        },
        {
          $inc: {
            "products.$.quantity": 1,
            totalPrice: product.price,
            totalQuantity: 1,
            "products.$.price": product.price,
          },
        }
      );
      res.json({
        success: "countAdded",
        message: 1,
      });
    } else {
      await cartCLTN.findByIdAndUpdate(userCart._id, {
        $push: {
          products: [
            {
              name: mongoose.Types.ObjectId(req.body.id),
              price: product.price,
            },
          ],
        },
        $inc: {
          totalPrice: product.price,
          totalQuantity: 1,
        },
      });
      res.json({
        success: "addedToCart",
        message: 1,
      });
    }
  } catch (error) {
    console.log("Erro ao adicionar ao carrinho: " + error);
  }
};

exports.remove = async (req, res) => {
  try {
    let productFromCart = await cartCLTN.aggregate([
      {
        $match: {
          customer: mongoose.Types.ObjectId(req.session.userID),
        },
      },
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.name": mongoose.Types.ObjectId(req.body.id),
        },
      },
    ]);
    const cartID = productFromCart[0]._id;
    productFromCart = productFromCart[0].products;
    await cartCLTN.findByIdAndUpdate(cartID, {
      $pull: {
        products: {
          name: req.body.id,
        },
      },
      $inc: {
        totalPrice: -productFromCart.price,
        totalQuantity: -productFromCart.quantity,
      },
    });
    res.json({
      success: "removed",
    });
  } catch (error) {
    console.log("Erro ao remover item do carrinho: " + error);
  }
};

exports.addCount = async (req, res) => {
  try {
    const product = await productCLTN.findById(req.body.id);
    const count = await cartCLTN.findOneAndUpdate(
      {
        customer: req.session.userID,
        products: {
          $elemMatch: { name: mongoose.Types.ObjectId(req.body.id) },
        },
      },
      {
        $inc: {
          "products.$.quantity": 1,
          totalPrice: product.price,
          "products.$.price": product.price,
          totalQuantity: 1,
        },
      }
    );

    const userCart = await cartCLTN.findOne({
      customer: req.session.userID,
    });
    const allProducts = await userCart.products;
    const currentProduct = allProducts.find((el, i) => {
      if (el.name.valueOf() == req.body.id) {
        return el;
      }
    });
    res.json({
      data: {
        currentProduct,
        userCart,
      },
    });
  } catch (error) {
    console.log("Err ao adicionar ao carrinho: " + error);
  }
};

exports.reduceCount = async (req, res) => {
  try {
    const product = await productCLTN.findById(req.body.id);
    const currentItem = await cartCLTN.aggregate([
      {
        $match: {
          customer: mongoose.Types.ObjectId(req.session.userID),
        },
      },
      {
        $unwind: "$products",
      },
      {
        $match: {
          "products.name": product._id,
        },
      },
    ]);
    const totalQtyPerItem = currentItem[0].products.quantity;
    if (totalQtyPerItem > 1) {
      const count = await cartCLTN.findOneAndUpdate(
        {
          _id: currentItem[0]._id,
          products: {
            $elemMatch: { name: mongoose.Types.ObjectId(req.body.id) },
          },
        },
        {
          $inc: {
            "products.$.quantity": -1,
            totalPrice: -product.price,
            "products.$.price": -product.price,
            totalQuantity: -1,
          },
        }
      );
    }
    const userCart = await cartCLTN.findOne({
      customer: req.session.userID,
    });
    const allProducts = await userCart.products;
    const currentProduct = allProducts.find((el, i) => {
      if (el.name.valueOf() == req.body.id) {
        return el;
      }
    });
    res.json({
      data: {
        currentProduct,
        userCart,
      },
    });
  } catch (error) {
    console.log("Erro ao reducing count do carrinho: " + error);
  }
};
