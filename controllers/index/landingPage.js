const Produto = require("../../models/admin/product");
const Categoria = require("../../models/admin/category");
const BannerCLTN = require("../../models/admin/banner");

exports.viewAll = async (req, res) => {
  try {
    let currentUser = null;

    const allProducts = await Produto.find({listed: true}).sort({ _id: -1 });
    let men = [];
    let women = [];
    allProducts.forEach((product) => {
      if (product.category == "63a0523eceb514042442b2f4") {
        women.push(product);
      } else if (product.category == "63a051ff7b36d782859a1e3e") {
        men.push(product);
      }
    });
    women = women.slice(0, 3);
    men = men.slice(0, 3);

   
    const categories = await Categoria.find({});
 
    const banners = await BannerCLTN.find({ active: true }).limit(3);
    const newReleases = allProducts.slice(0, 8);

    const sold = await Produto.find({listed: true}).sort({ views: -1 });
    res.render("index/landingPage", { 
      session: req.session.userID,
      newReleases,
      banners,
      details: categories,
      produtos: sold,
      documentTitle: 'Página principal'
  })
  } catch (error) {
    console.log("Erro ao renderizar a página principal: " + error);
  }
};
