const blogCLTN = require("../../models/admin/blog");
const Categoria = require("../../models/admin/category"); 
const UserCLTN = require("../../models/user/details");
const productListing = require("../../controllers/index/productListing");
const ReviewCLTN = require("../../models/user/reviews");
const moment = require('moment')
moment.locale('pt-br');

exports.viewAll = async (req, res) => {
  try {
    const allblog = await blogCLTN.find({listed: true}).sort({ _id: -1 }).populate("category");
    const litleblog = await blogCLTN.find({listed: true}).sort({ _id: 1 }).limit(4)
    const categories = await Categoria.find({}); 
    res.render("index/blog", { 
      session: req.session.userID,
      allblog,
      details: categories,
      documentTitle: 'Página de blogs',
      moment,
      litleblog,
  })
  } catch (error) {
    console.log("Erro ao renderizar a página de blog: " + error);
  }
};


exports.Detalhe = async (req, res) => {
  try {
    const categories = await Categoria.find({});
    const currentUser = await UserCLTN.findById(req.session.userID);
    const allblog = await blogCLTN.find({listed: true}).sort({ _id: -1 }).limit(4)
    const blogDetalhe = await blogCLTN.findById(req.params.id).populate("category");
    res.render("index/blogDetalhe", {
      documentTitle: blogDetalhe.titulo,
      blogDetalhe,
      currentUser,
      session: req.session.userID,
      moment,
      allblog,
      details: categories,
    });
  } catch (error) {
    console.log("Erro ao renderizar página de detalhe de blog: " + error);
  }
};

exports.CheckListagem = async (req, res) => {
  const productListedCheck = await blogCLTN.findById(req.body.id);
  if (productListedCheck.listed) {
    res.json({
      message: "listed",
    });
  } else {
    res.json({
      message: "unlisted",
    });
  }
};  