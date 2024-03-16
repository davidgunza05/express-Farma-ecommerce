const { default: mongoose } = require("mongoose");
const sharp = require("sharp");
const categoriesCLTN = require("../../models/admin/category");
const productCLTN = require("../../models/admin/product");
const moment = require("moment");
moment.locale('pt-br');

exports.page = async (req, res) => {
  try {
    const seteDiasAntes = moment().add(7, 'days').toDate(); 

    const allCategories = await categoriesCLTN.find({});
    const allProducts = await productCLTN.find({}).populate("category").sort({ _id: -1 })
    res.render("admin/partials/products", {
      documentTitle: "Gerenciamento de produtos",
      categories: allCategories,
      products: allProducts, 
      session: req.session.admin,
      moment,
      data: await productCLTN.find({ expiryDate: { $lte: seteDiasAntes }}),
    });
  } catch (error) {
    console.log("Erro ao renderizar página de produtos: " + error);
  }
};

exports.addProduct = async (req, res) => {
  try {

    const { expiryDate } = req.body;
    const currentDate = new Date();
    const oneMonthFromNow = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
  
    const nameCheck = await productCLTN.findOne({ name: req.body.name });


    if (new Date(expiryDate) < oneMonthFromNow) {

      req.flash('error_msg', 'A data de expiração deve ser maior que um mês a partir da data atual.')
      res.redirect("/admin/product_management");
    
    }else if(nameCheck){
      req.flash('error_msg', 'Já existe produto com este nome.')
      res.redirect("/admin/product_management");
    }else{

      
      let frontImage = `${req.body.name}_frontImage_${Date.now()}.WebP`;
      sharp(req.files.frontImage[0].buffer)
      .resize(500)
        .toFile(`public/img/products/${frontImage}`);
      req.body.frontImage = frontImage;

      let thumbnail = `${req.body.name}_thumbnail_${Date.now()}.WebP`;
      sharp(req.files.thumbnail[0].buffer)
      .resize(500)
        .toFile(`public/img/products/${thumbnail}`);
      req.body.thumbnail = thumbnail;

      const newImages = [];
      for (i = 0; i < 3; i++) {
        imageName = `${req.body.name}_image${i}_${Date.now()}.WebP`;
        sharp(req.files.images[i].buffer)
      .resize(500) 
      .toFile(`public/img/products/${imageName}`);
        newImages.push(imageName);
      }
      req.body.images = newImages;

    
      req.body.category = mongoose.Types.ObjectId(req.body.category);
      const newProduct = new productCLTN(req.body);
      await newProduct.save();
      req.flash('success_msg', 'Produto criado com sucesso!')
      res.redirect("/admin/product_management");
    }
  } catch (error) {
    console.log("Erro ao criar produto: " + error);
  }
};


exports.editPage = async (req, res) => {
  try {
    const currentProduct = await productCLTN .findById(req.query.id) .populate("category");
    const categories = await categoriesCLTN.find({});
    res.render("admin/partials/editProducts", {
      session: req.session.admin,
      documentTitle: "Editar produtos",
      product: currentProduct,
      categories: categories,
    });
  } catch (error) {
    console.log("Erro ao redirecionar página produto " + error);
  }
};

exports.edit = async (req, res) => {
  try { 
    const { expiryDate } = req.body;
    const currentDate = new Date();
    const oneMonthFromNow = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
  
    const nameCheck = await productCLTN.findOne({ name: req.body.name });

    if (new Date(expiryDate) < oneMonthFromNow) {

      req.flash('error_msg', 'A data de expiração deve ser maior que um mês a partir da data atual.')
      res.redirect('/admin/product_management');

    }else{

    if (JSON.stringify(req.files) !== "{}") {

      if (req.files.frontImage) {
        let frontImage = `${req.body.name}_frontImage_${Date.now()}.WebP`;
        sharp(req.files.frontImage[0].buffer)
        .resize(500)
          .toFile(`public/img/products/${frontImage}`);
        req.body.frontImage = frontImage;
      }

      if (req.files.thumbnail) {
        let thumbnail = `${req.body.name}_thumbnail_${Date.now()}.WebP`;
        sharp(req.files.thumbnail[0].buffer)
        .resize(500)
          .toFile(`public/img/products/${thumbnail}`);
        req.body.thumbnail = thumbnail;
      }
      
      if (req.files.images) {
        const newImages = [];
        for (i = 0; i < 3; i++) {
          imageName = `${req.body.name}_image${i}_${Date.now()}.WebP`;
          sharp(req.files.images[i].buffer)
        .resize(500)
        .toFile(`public/img/products/${imageName}`);
          newImages.push(imageName);
        }
        req.body.images = newImages;
      }
    }
    req.body.category = mongoose.Types.ObjectId(req.body.category);
    await productCLTN.findByIdAndUpdate(req.query.id, req.body);
    req.flash('success_msg', 'Produto editado com sucesso!')
    res.redirect("/admin/product_management");
    }

  } catch (error) {
    console.log("Erro ao editar produto: " + error);
  }
};

exports.changeListing = async (req, res) => {
  try {
    const currentProduct = await productCLTN.findById(req.query.id);
    let currentListing = currentProduct.listed;
    if (currentListing == true) {
      currentListing = false;
    } else {
      currentListing = true;
    }
    currentListing = Boolean(currentListing);
    await productCLTN.findByIdAndUpdate(currentProduct._id, {
      listed: currentListing,
    });
    req.flash('success_msg', 'Listagem alterada com sucesso')
    res.redirect("/admin/product_management");
  } catch (error) {
    console.log("Produto alterado list com sucesso!: " + error);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    const deleteproduct = await productCLTN.findByIdAndDelete(productId);
    req.flash('success_msg', 'Produto deletado com sucesso')
    res.redirect("/admin/product_management");
  } catch (error) {
    console.log("Error ao deletar produto: " + error);
  }
};