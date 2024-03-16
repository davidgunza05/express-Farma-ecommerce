const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const objectIdCheck = require("../middlewares/user/objectIdCheck");
const landingPage = require("../controllers/index/landingPage");
const product = require("./../controllers/index/product");
const productListing = require("../controllers/index/productListing");
const blog = require("../controllers/index/blog");
const productCLTN = require("../models/admin/product");
const Contacto = require("../models/farmacia/contacto");
const Produto = require("../models/admin/product");
const UserCLTN = require("../models/user/details");
const sessionCheck = require("../middlewares/user/sessionCheck");
const Categoria = require("../models/admin/category");

// Landing Page
router.get("/", landingPage.viewAll);

// Our collection
router 
  .route("/products")
  .get(productListing.ourCollection)
  .post(productListing.sortBy)
router.get("/categoria/:id", productListing.categories);

// Single product Page
router
  .route("/products/:id")
  .get(objectIdCheck, product.view)
  .patch(objectIdCheck, product.listedCheck);

router.get('/pesquisar', async (req, res) => {
  try {
    const categories = await Categoria.find({});
    const { q } = req.query;
    const regex = new RegExp(q, 'i');
    const products = await productCLTN.find({
      $or: [{ name: regex }, { composicao: regex }, { fabricante: regex }],
    });
    res.render('index/search', { products, q, documentTitle: `Resultado de pesquisa`, details: categories, session: req.session.userID, });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router 
  .route("/blog")
  .get(blog.viewAll)
router
  .route("/blog/:id")
  .get(objectIdCheck, blog.Detalhe)
  .patch(objectIdCheck, blog.CheckListagem);
/*
router.get('/categoria/:id', async (req, res) => {
  try {
    const categoriaId = req.params.id;
    const produtos = await Produto.find({ categoria: categoriaId });
    res.render('categoria', { produtos });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno do servidor');
  }
});*/
router.get('/contacto', sessionCheck, async (req, res) => {
  const userID = req.session.userID;
  const currentUser = await UserCLTN.findById(userID);
  const categories = await Categoria.find({});

  res.render('index/contacto', {
    currentUser,
    session: req.session.userID,
    documentTitle: `Página de contacto`,
    details: categories,
   });
});

router.post('/contacto', async (req, res) =>{
  try {
    const newContacto = new Contacto({
      name: req.body.name,
      email: req.body.email,
      msg: req.body.msg,
      image: req.body.image,
      resposta: req.body.resposta,
    });
    await newContacto.save();
    req.flash('success_msg', 'Mensagem enviada com com sucesso!')
    res.redirect("/contacto");
  } catch (error) {
    req.flash('error_msg', 'Erro ao enviar mensagem!')
    res.redirect("/contacto");
  }
})

router.get('/sobre', async (req, res) => {
  const categories = await Categoria.find({});
  res.render('index/sobre', {
    session: req.session.userID,
    documentTitle: `Página sobre`,
    details: categories,
  });
}); 


const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

router.get('/download-pdf', (req, res) => {
  const doc = new PDFDocument();
  // Adicione o conteúdo que deseja ao documento PDF aqui usando as funções do PDFKit
  doc.text('Exemplo de conteúdo PDF');

  const fileName = 'arquivo.pdf';
  const filePath = path.join(__dirname, '../public/pdf', fileName);

  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);
  doc.end();

  writeStream.on('finish', () => {
    // Envie o arquivo PDF para download
    res.download(filePath, fileName, (err) => {
      if (err) {
        // Manipule erros aqui
      }
      // Exclua o arquivo após o download, se necessário
      fs.unlink(filePath, (err) => {
        if (err) {
          // Manipule erros de exclusão de arquivo aqui
        }
      });
    });
  });
});



 

module.exports = router;