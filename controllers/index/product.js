const productCLTN = require("./../../models/admin/product");
const UserCLTN = require("../../models/user/details");
const wishlistCLTN = require("../../models/user/wishlist");
const productListing = require("../../controllers/index/productListing");
const ReviewCLTN = require("../../models/user/reviews");
const moment = require('moment')
const Categoria = require("../../models/admin/category");
moment.locale('pt-br');

exports.view = async (req, res) => {
  try {
    const categories = await Categoria.find({});

    const currentUser = await UserCLTN.findById(req.session.userID);
    const productDetails = await productCLTN.findById(req.params.id).populate("category");
    // Obter a categoria do produto
    const categoryId = productDetails.category;
    // Buscar outros produtos com a mesma categoria (exceto o próprio produto)
    const relatedProducts = await productCLTN.find({
      category: categoryId,
      _id: { $ne: req.params.id } // Excluir o próprio produto
    }).exec();

    let productExistInWishlist = null;
    if (currentUser) {
      productExistInWishlist = await wishlistCLTN.findOne({
        customer: currentUser._id,
        products: req.params.id,
      });
    }
    let reviews = await ReviewCLTN.find({ product: productDetails._id })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "customer", 
        select: "name photo",
      });
    const numberOfReviews = reviews.length;
    reviews = reviews.slice(0, 6);
    if (reviews == "") {
      reviews = null;
    }  
    
    res.render("index/product", {
      documentTitle: productDetails.name,
      productDetails,
      currentUser,
      session: req.session.userID,
      productExistInWishlist,
      reviews,
      numberOfReviews,
      moment,
      details: categories,
      relatedProducts,
    });
  } catch (error) {
    console.log("Erro ao renderizar página de produto: " + error);
  }
};

exports.listedCheck = async (req, res) => {
  const productListedCheck = await productCLTN.findById(req.body.id);
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
