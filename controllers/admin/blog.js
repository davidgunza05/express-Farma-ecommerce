const { default: mongoose } = require("mongoose");
const BlogCLTN = require("../../models/admin/blog");
const categoriesCLTN = require("../../models/admin/category");
const sharp = require("sharp");
const moment = require("moment");
moment.locale('pt-br');

exports.viewAll = async (req, res) => {
  try {
    const allCategories = await categoriesCLTN.find({});
    const allBlogs = await BlogCLTN.find().populate("category").sort({ _id: -1 })
    res.render("admin/partials/blog", {
      session: req.session.admin,
      documentTitle: "Gerenciamento de Blogs", 
      allBlogs,
      moment,
      categories: allCategories,
    });
  } catch (error) {
    console.log("Erro ao mostrar todos blogs: " + error);
    res.redirect("/admin/blog_management");
  }
};


exports.BlogDetail = async (req, res) => {
  try { 
    const currenBlog = await BlogCLTN.findById(req.params.id)
    res.render("admin/partials/blogDetails", {
      currenBlog,
      session: req.session.admin,
      documentTitle: 'Ver postagem',
      moment,
    });
  } catch (error) {
    console.log("erro ao renderizar email: " + error);
  }
};
 
exports.DeleteComentario = async(req, res) =>{
  const Id = req.params.id;

  try {
    const blogId = req.query.id; 
    
    await BlogCLTN.findByIdAndDelete(blogId, { $push: { reviews}}, (err, blog) => {
      if (err) {
        console.log(err);
        req.flash('error_msg', 'Erro ao deletar postagem')
        res.redirect(`/admin/blog_management/${Id}`);
      } else {
          req.flash('success_msg', 'Postagem deletado com sucesso')
          res.redirect(`/admin/blog_management/${Id}`);
      }
    })
    
  } catch (error) {
    console.log("Error ao deletar Postagem: " + error);
    res.redirect(`/admin/blog_management/${Id}`);
  }
}

exports.addNew = async (req, res) => {
  try {
    if (req.file) {
      let imageblog = `blog_${Date.now()}.WebP`;
      sharp(req.file.buffer)
      .toFormat("WebP")
      .resize(500)
      .toFile(`public/img/blogs/${imageblog}`);

      req.body.imageblog = imageblog;
    }
    const newBanner = new BlogCLTN(req.body);
    newBanner.save();
    req.flash('success_msg', 'Postagem criada com sucesso!')
    res.redirect("/admin/blog_management");
  } catch (error) {
    req.flash('error_msg', 'Erro ao adicionar novo postagem doblog!')
    res.redirect("/admin/blog_management");
    console.log("Erro ao adicionar novo postagem doblog: " + error);
  }
};

exports.editPage = async (req, res) => {
  try {
    const currentPost = await BlogCLTN.findById(req.query.id).populate("category");
    const categories = await categoriesCLTN.find({});
    res.render("admin/partials/editBlog", {
      session: req.session.admin,
      documentTitle: "Editar postagem",
      blog: currentPost,
      categories: categories,
    });
  } catch (error) {
    console.log("Erro ao redirecionar página de blogs " + error);
  }
};

exports.edit = async (req, res) => {
  try {
    if (JSON.stringify(req.files) !== "{}") {
      if (req.file) {
        let imageblog = `blog_${Date.now()}.WebP`;
        sharp(req.file.buffer)
        .toFormat("WebP")
        .resize(500)
        .toFile(`public/img/blogs/${imageblog}`);
  
        req.body.imageblog = imageblog;
      }
    }
    req.body.category = mongoose.Types.ObjectId(req.body.category);
    await BlogCLTN.findByIdAndUpdate(req.query.id, req.body);
    req.flash('success_msg', 'Blog editado com sucesso!')
    res.redirect("/admin/blog_management");
  } catch (error) {
    console.log("Erro ao editar Blog: " + error);
  }
};
 
exports.deleteBlog = async (req, res) => {
  try {
    const blogId = req.query.id;
    const deleteproduct = await BlogCLTN.findByIdAndDelete(blogId);
    req.flash('success_msg', 'Postagem deletado com sucesso')
    res.redirect("/admin/blog_management");
  } catch (error) {
    console.log("Error ao deletar Postagem: " + error);
  }
};


exports.changeListing = async (req, res) => {
  try {
    const currentProduct = await BlogCLTN.findById(req.query.id);
    let currentListing = currentProduct.listed;
    if (currentListing == true) {
      currentListing = false;
    } else {
      currentListing = true;
    }
    currentListing = Boolean(currentListing);
    await BlogCLTN.findByIdAndUpdate(currentProduct._id, {
      listed: currentListing,
    });
    req.flash('success_msg', 'Listagem alterada com sucesso')
    res.redirect("/admin/blog_management");
  } catch (error) {
    console.log("Blog alterado list com erro!: " + error);
  }
};
