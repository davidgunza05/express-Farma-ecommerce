const express = require("express");
const router = express.Router();
const sessionCheck = require("../middlewares/user/sessionCheck");
const objectIdCheck = require("../middlewares/user/objectIdCheck");
const imageUpload = require("../utilities/imageUpload");
const imageProcessor = require("../utilities/imageProcessor");
const signUp = require("../controllers/user/signUp");
const signIn = require("../controllers/user/signIn");
const forgotPassword = require("../controllers/user/forgotPassword");
const profile = require("../controllers/user/profile");
const address = require("./../controllers/user/address");
const cart = require("../controllers/user/cart");
const checkout = require("../controllers/user/checkout");
const wishlist = require("../controllers/user/wishlist");
const orders = require("../controllers/user/orders");
const reviews = require("../controllers/user/reviews");
const signOut = require("../controllers/user/signOut");
const product = require("../models/admin/product");
const blog = require("../models/admin/blog");
const orderCLTN = require("../models/user/orders");
const moment = require('moment');
moment.locale('pt-br');


// Sign Up
router 
  .route("/signUp")
  .get(signUp.signUpPage)
  .post(signUp.registerUser);
/*router
  .route("/otp_verification")
  .get(signUp.otpPage)
  .post(signUp.otpVerification);
*/
// Sign In
router
  .route("/signIn")
  .get(signIn.signInPage)
  .post(signIn.userVerification);

// Password Handlers
router
  .route("/forgotPassword")
  .get(forgotPassword.Page)
  .post(forgotPassword.emailVerification);
router.get("/forgotPassword/otpVerification", forgotPassword.otpPage);
router.get(
  "/forgotPassword/otpVerification/resend_OTP",
  forgotPassword.emailVerification
);

router.post("/forgotPassword/otpVerification", forgotPassword.otpVerification);

router
  .route("/changePassword")
  .get(forgotPassword.passwordChangePage)
  .post(forgotPassword.updatePassword);

// Profile wish
router
  .route("/profile")
  .get(sessionCheck, profile.page)
  .post(
    sessionCheck,
    imageUpload.single("photo"),
    imageProcessor.userProfilePic,
    profile.update
  );

// Addresses
router.get("/addresses", sessionCheck, address.viewAll);
router.post("/addresses/addNew", sessionCheck, address.addNew);
router.get("/addresses/delete", sessionCheck, address.deleteAddress);
router.get("/addresses/changeRole", sessionCheck, address.defaultToggler);
// Wishlist
router
  .route("/wishlist")
  .get(sessionCheck, wishlist.viewAll)
  .patch(wishlist.addOrRemove)
  .delete(wishlist.remove);

// Cart
router
  .route("/cart")
  .get(sessionCheck, cart.viewAll)
  .post(sessionCheck, cart.addToCart)
  .delete(sessionCheck, cart.remove);
router
  .route("/cart/count")
  .put(sessionCheck, cart.addCount)
  .delete(sessionCheck, cart.reduceCount);

// Checkout
router
  .route("/cart/checkout")
  .get(sessionCheck, checkout.view)
  .put(sessionCheck, checkout.coupon)
  .post(sessionCheck, checkout.checkout);
router.post(
  "/cart/checkout/changeDefaultAddress",
  sessionCheck,
  checkout.defaultAddress
);
router.get("/cart/checkout/:id",  checkout.result);

// Orders
router.get("/orders", sessionCheck, orders.viewAll);
router
  .route("/orders/:id")
  .get(sessionCheck, objectIdCheck, orders.details)
  .patch(sessionCheck, objectIdCheck, orders.cancel);

// Reviews
router
  .route("/reviews")
  .post(sessionCheck, reviews.addNew)
  .patch(reviews.helpful);

router.post('/avaliar/:id', (req, res) => {
  const productId = req.params.id;
  const review = {
    user: req.body.user,
    rating: parseInt(req.body.rating),
    comment: req.body.comment
  };
  product.findByIdAndUpdate(productId, { $push: { reviews: review }}, (err, product) => {
    if (err) {
      console.log(err);
    } else {
      req.flash('success_msg', 'Avaliação feita com sucesso!')
      res.redirect(`/products/${productId}`);
    }
  });
});

router.post('/blog/avaliar/:id', (req, res) => {
  const blogId = req.params.id;
  const review = {
    user: req.body.user,
    rating: parseInt(req.body.rating),
    comment: req.body.comment
  };
  blog.findByIdAndUpdate(blogId, { $push: { reviews: review }}, (err, blog) => {
    if (err) {
      console.log(err);
    } else {
      req.flash('success_msg', 'Avaliação feita com sucesso!')
      res.redirect(`/blog/${blogId}`);
    }
  });
});
 

router.post('/cancelar/order/:id', async (req, res) => {
  const id = req.params.id
  await orderCLTN.findByIdAndUpdate(id, {
    $set: {
      status: 'Cancelled',
      deliveredOn: null
    }
  }).then(()=>{
    req.flash('success_msg', 'Pedido cancelado com sucesso')
    res.redirect(`/users/orders/${id}`)
  }).catch((err) =>{
    console.log('Deu um erro ao cancelar a compra', err)
    res.redirect(`/users/orders/${id}`)
  }) 
})

// Sign out
router.get("/signOut", sessionCheck, signOut.signOut);


const PDFDocument = require('pdfkit');
const fs = require('fs'); 

router.get('/fatura/pdf/:id', sessionCheck, (req, res) => {
  const compraId = req.params.id;

  orderCLTN.findById(compraId, (err, compra) => {
    if (err || !compra) {
      return res.status(404).send('Compra não encontrada', err);
    }

    // Gerar o PDF
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(`fatura_${compraId}.pdf`);
    doc.pipe(stream);

    doc.text(`ID do pedido: ${compra._id.toString('hex').slice(0, 10)}`);
    doc.text(`Pedido em : ${moment(compra.orderedOn).format('LLL')}`);
    doc.text(` `);
    doc.text(`==================================================================`);
    doc.text(`Produtos:`);
    doc.text(` `);
     if(compra.summary != null){ 
      compra.summary.forEach((product,i)=> {
        doc.text(`${i+1}.${product.product.name} / ${product.quantity} / ${product.totalPrice} KZ`);
      })
    }
    doc.text(` `);
    doc.text(` `);
    doc.text(`Endereço para entrega:`);
    doc.text(` `);
    if(compra.shippingAddress!=""){ 
      doc.text(`Província: ${compra.shippingAddress.provincia}`);
      doc.text(`Município / Distrito: ${compra.shippingAddress.municipio}`);
      doc.text(`Bairro / Outro: ${compra.shippingAddress.bairro}`);
      doc.text(`Prédio: ${compra.shippingAddress.predio} - Casa / Aprt Nº: ${compra.shippingAddress.pincode}`);
      doc.text(`Contacto: ${compra.shippingAddress.contacto}`);
    }
    doc.text(`==================================================================`);
    doc.text(` `);
    doc.text(`Nome do cliente: ${compra.customer.name}`);
    doc.text(`Email do cliente: ${compra.customer.email}`);
    doc.text(` `);
    doc.text(` `); 
    doc.text(`Quantidade total: ${compra.totalQuantity}`);
    doc.text(`Forma de pagamento: ${compra.modeOfPayment}`);

    if(compra.couponUsed){ 
      doc.text(`Desconto usuado: ${compra.couponUsed.name}`);
    }else{
      doc.text(`Nenhum desconto usado`);
    }
    doc.text(``);
    doc.text(`Preço: ${compra.price} KZ`);
    doc.text(`Preço com desconto: ${compra.discountPrice} KZ`);
    doc.text(`Preço final: ${compra.finalPrice} KZ`);
    doc.text(``);

    if(compra.delivered==true){
      doc.text(`Estado do Pedido: Concluído em ${moment(compra.orderedOn).format('LLL')}`);
    }else{
      doc.text(`${compra.status}`);
    } 

    doc.end();

    stream.on('finish', () => {
      // Envie o arquivo PDF para download
      res.download(`fatura_${compraId}.pdf`, `fatura_${compraId}.pdf`, (err) => {
        if (err) {
          console.error('Erro ao baixar a fatura:', err);
        }
        // Exclua o arquivo PDF após o download
        fs.unlink(`fatura_${compraId}.pdf`, (err) => {
          if (err) {
            console.error('Erro ao excluir o arquivo PDF:', err);
          }
        });
      });
    });
  }).populate("summary.product").populate("couponUsed").populate("customer", "name email");
});


module.exports = router;
