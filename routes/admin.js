const express = require("express");
const router = express.Router();
const sessionCheck = require("../middlewares/admin/sessionCheck");
const objectIdCheck = require("../middlewares/admin/objectIdCheck");
const signIn = require("../controllers/admin/signIn");
const customers = require("../controllers/admin/customers");
const categories = require("../controllers/admin/category");
const products = require("../controllers/admin/products");
const upload = require("../utilities/imageUpload");
const coupon = require("../controllers/admin/coupons");
const blog = require("../controllers/admin/blog");
const dashboard = require("../controllers/admin/dashboard");
const orders = require("../controllers/admin/orders");
const banner = require("../controllers/admin/banner");
const salesReport = require("../utilities/salesReport");
const signOut = require("../controllers/admin/signOut");
const contactCLTN = require('../models/farmacia/contacto') 
const orderCLTN = require("../models/user/orders");
const moment = require('moment');
moment.locale('pt-br');

// Sign In
router
  .route("/")
  .get(signIn.page)
  .post(signIn.verification);

// Customer Management
router
  .route("/customer_management")
  .get(sessionCheck, customers.viewAll)
  .patch(sessionCheck, customers.changeAccess);

router
  .route("/customer_management/delete_customer")
  .get(sessionCheck,customers.deleteCustomers);

// Category Management
router
  .route("/categories")
  .get(sessionCheck, categories.list)
  .post(sessionCheck, categories.addCategory);
router
  .route("/categories/edit")
  .get(sessionCheck, categories.editPage)
  .post(sessionCheck, categories.editCategory);
router
  .route("/categories/delete_category")
  .get(sessionCheck,categories.deleteCategory);

// Product Management
router.get("/product_management", sessionCheck, products.page);
router.post(
  "/product_management/add_product",
  sessionCheck,
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 3 },
  ]),
  products.addProduct
);

router
  .route("/product_management/delete_product")
  .get(sessionCheck,products.deleteProduct);

router
  .route("/product_management/edit")
  .get(sessionCheck, products.editPage)
  .post(
    sessionCheck,
    upload.fields([
      { name: "frontImage", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
      { name: "images", maxCount: 3 },
    ]),
    products.edit
  );
router.get(
  "/product_management/changeListing",
  sessionCheck,
  products.changeListing
);

// Coupon Management
router.get("/coupon_management", sessionCheck, coupon.page);
router.post("/coupon_management/addNew", sessionCheck, coupon.addNew);
router.get(
  "/coupon_management/changeActivity",
  sessionCheck,
  coupon.changeActivity
);
router
  .route("/coupon/delete_coupon")
  .get(sessionCheck,coupon.deleteCoupon);
// Coupon Management
//router.get("/contacto_management", sessionCheck, contacto.page);
//router.post("/contacto_management/addNew", sessionCheck, contacto.addNew);


// Dashboard
router
  .route("/dashboard")
  .get(sessionCheck, dashboard.view)
  .put(sessionCheck, dashboard.chartData);

// Relatorio
router
  .route('/total')
  .get(sessionCheck, dashboard.OrderData);

router
  .route('/mais_vendidos')
  .get(sessionCheck, dashboard.mostSoldProducts)
 
router
  .route('/status_pedido')
  .get(sessionCheck, dashboard.Status);

   
router
  .route('/clientes_mais_pedidos')
  .get(sessionCheck, dashboard.CustomersSold);
  
// Order Management
router
  .route("/orders")
  .get(sessionCheck, orders.viewAll)
  .patch(sessionCheck, orders.deliver);

router
  .route("/orders/delete_order")
  .get(sessionCheck, orders.deleteOrder);

router
  .route("/orders/:id")
  .get(sessionCheck, objectIdCheck, orders.details);

// Banner Management
router
  .route("/banner_management")
  .get(sessionCheck, banner.viewAll)
  .post(sessionCheck, upload.single("bannerImage"), banner.addNew)
  .patch(sessionCheck, banner.changeActivity)
  .delete(sessionCheck, banner.delete);

//Blog Mangement
router
  .route("/blog_management")
  .get(sessionCheck, blog.viewAll)
  .post(sessionCheck, upload.single("imageblog"), blog.addNew)
router
  .route("/blog_management/delete_blog")
  .get(sessionCheck,blog.deleteBlog);

router
  .route("/blog_management/:id")
  .get(sessionCheck,blog.BlogDetail);

router
  .route("/blog_management/postagem/delete_postagem")
  .get(sessionCheck,blog.DeleteComentario);
  
router
  .route("/blog_management/edit")
  .get(sessionCheck, blog.editPage)
  .post( sessionCheck,upload.single("imageblog"),blog.edit);

router.get("/blog_management/changeListing",sessionCheck,blog.changeListing);


// Sales Report
router.route("/salesReport").get(salesReport.download);

// Sign Out
router.get('/sair', sessionCheck, (req, res) =>{
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log("Erro ao sair como admin: " + error);
  }
})

router.get('/mail_management', sessionCheck, async (req, res) =>{
  try{
    const contacts = await contactCLTN.find({}).sort({ _id: -1 })
    res.render('admin/partials/mail', {
      session: req.session.admin,
      documentTitle: 'Gerenciamento de email',
      moment,
      details: contacts,
      sessionCheck,
    })
  }catch(err){
    console.log('erro ao renderizar email: ', err)
  }
})

router.get('/mail_managements/:id', sessionCheck, async (req, res) =>{ 
try { 
  const currentMail = await contactCLTN.findById(req.params.id)
  res.render("admin/partials/mailDetails", {
    currentMail,
    session: req.session.admin,
    documentTitle: 'Gerenciamento de email',
    sessionCheck,
    moment,
    documentTitle: "Ler email enviado",
  });
} catch (error) {
  console.log("erro ao renderizar email: " + error);
}
})

router
  .route("/mail/delete_email")
  .get(sessionCheck,customers.deleteContacto);


router.post('/cancelar/order/:id', async (req, res) => {
  const id = req.params.id
  await orderCLTN.findByIdAndUpdate(id, {
    $set: {
      status: 'Cancelled',
      deliveredOn: null
    }
  }).then(()=>{
    req.flash('success_msg', 'Pedido cancelado com sucesso')
    res.redirect(`/admin/orders/${id}`)
  }).catch((err) =>{
    console.log('Deu um erro ao cancelar a compra', err)
    res.redirect(`/admin/orders/${id}`)
  }) 
})

router.get('/order/pesquisar', sessionCheck, async (req, res) => {
  try {
    const { q } = req.query;
    const regex = new RegExp(q, 'i');
    const orders = await orderCLTN.find({
      $or: [{ id: regex }],
    }).populate('customer')
    res.render('admin/partials/ordersPesquisar', { orders, q, moment, documentTitle: `Resultado de pesquisa` });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}); 

 
const PDFDocument = require('pdfkit');
const fs = require('fs'); 

router.get('/fatura/pdf/:id', (req, res) => {
  const compraId = req.params.id;

  orderCLTN.findById(compraId, (err, compra) => {
    if (err || !compra) {
      return res.status(404).send('Compra não encontrada');
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