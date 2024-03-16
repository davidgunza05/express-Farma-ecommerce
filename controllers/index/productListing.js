const categoryCLTN = require("../../models/admin/category");
const productCLTN = require("../../models/admin/product");
const UserCLTN = require("../../models/user/details");

exports.ourCollection = async (req, res) => {
  try { 
    let listing = req.session.listing;
    if (!listing) {
      listing = await productCLTN.find({ listed: true });
    }
    const categories = await categoryCLTN.find({});

    const sort = req.query.sort || 'default'; // Obtém o parâmetro de ordenação da query string 
    if (sort === 'crescente') {
      listing = await productCLTN.find().sort({ price: 1 }).exec(); // Ordena por preço ascendente
      //listing = await productCLTN.find().sort({ reviews: 1 }).exec(); // Ordena por preço ascendente
    } else if (sort === 'decrescente') {
      listing = await productCLTN.find().sort({ price: -1 }).exec(); // Ordena por nome em ordem alfabética
    } else if (sort === 'A_a_Z') {
      listing = await productCLTN.find().sort({ name: 1 }).exec(); // Ordena por nome em ordem alfabética
    } else if (sort === 'Z_a_A') {
      listing = await productCLTN.find().sort({ name: -1 }).exec(); // Ordena por nome em ordem alfabética
    } else {
      listing = await productCLTN.find().exec(); // Mantém a ordem padrão
    }

    res.render("index/productListing", {
      session: req.session.userID,
      details: categories,
      listing,
      documentTitle: "Todos Produtos",
      sort,
    });
  } catch (error) {
    console.log("Error rendering our collection page: " + error);
  }
};

exports.sortBy = async (req, res) => {
  try {
    if (!req.session.listing) {
      req.session.listing = await productCLTN.find({ listed: true });
    }
    let listing = req.session.listing;

    if (req.body.sortBy === "ascending") {
      listing = listing.sort((a, b) => a.price - b.price);
      req.session.listing = listing;
      req.flsh('success_msg', 'Ordenado do menor ao maior preço')
      res.redirect('/');

    } else if (req.body.sortBy === "descending") {
      listing = listing.sort((a, b) => b.price - a.price);
      req.session.listing = listing;
      req.flsh('success_msg', 'Ordenado do maior ao menor preço')
      res.redirect('/');

    } else if (req.body.sortBy === "newReleases") {
      listing = listing.sort((a, b) => {
        const idA = a._id.toString();
        const idB = b._id.toString();
        if (idA < idB) {
          return 1;
        }
        if (idA > idB) {
          return -1;
        }
        return 0;
      });
      req.session.listing = listing;
      req.flsh('success_msg', 'Ordenado de forma padrão')
      res.redirect('/products');
    }
  } catch (error) {
    console.log("Error sorting in our collection: " + error);
  }
};

exports.categories = async (req, res) => {
  try {
    const categories = await categoryCLTN.find({});

    let listing;
    if (req.params.id == "newReleases") {
      if (req.session.listing) {
        listing = req.session.listing;
      } else {
        listing = await productCLTN.find().sort({ _id: -1 });
      }
      res.render("index/categorias", {
        listing: listing,
        documentTitle: `Todos Produtos`,
        details: categories,
        session: req.session.userID,
        listingName: "New Releases",
      });
    } else {
      const currentCategory = await categoryCLTN.findById(req.params.id);
      if (req.session.listing) {
        listing = req.session.listing;
      } else {
        listing = await productCLTN.find({
          category: currentCategory._id,
          listed: true,
        });
      }
      res.render("index/categorias", {
        listing: listing,
        documentTitle: `Categoria ${currentCategory.name}`,
        details: categories,
        session: req.session.userID,
        listingName: currentCategory.name,
      });
    }
  } catch (error) {
    console.log("Error categorizing in products page: " + error);
  }
};
