const categoryCLTN = require("../../models/admin/category");

exports.list = async (req, res) => {
  try {
    const categories = await categoryCLTN.find({});
    res.render("admin/partials/categories", {
      session: req.session.admin,
      documentTitle: "Gerenciamento de categoria",
      details: categories,
    });
  } catch (error) {
    console.log("Erro ao renderizar todas categorias: " + error);
  }
};

exports.addCategory = async (req, res) => {
  try {
    let inputCategory = req.body.category;
    inputCategory = inputCategory.toLowerCase();
    const categories = await categoryCLTN.find({});
    const categoryCheck = await categoryCLTN.findOne({ name: inputCategory });
    if (categoryCheck) {
      res.render("admin/partials/categories", {
        documentTitle: "Gerenciamento de categoria",
        details: categories,
        errorMessage: "Esta categoria já existe.",
      });
    } else {
      const newCategory = new categoryCLTN({
        name: inputCategory,
      });
      await newCategory.save();
      req.flash('success_msg', 'Categoria criada com sucesso')
      res.redirect("/admin/categories");
    }
  } catch (error) {
    console.log("Erro ao adicionar categoria: " + error);
  }
};

exports.editPage = async (req, res) => {
  try {
    const categoryId = req.query.id;
    const currentCategory = await categoryCLTN.findById(categoryId);
    res.render("admin/partials/editCategory", {
      session: req.session.admin,
      documentTitle: "Editar categoria",
      category: currentCategory,
    });
    req.session.currentCategory = currentCategory;
  } catch (error) {
    console.log("Erro ao editar categoria GET: " + error);
  }
};

exports.editCategory = async (req, res) => {
  try {
    const currentCategory = req.session.currentCategory;
    let newCategory = req.body.name;
    newCategory = newCategory.toUpperCase();
    const duplicationCheck = await categoryCLTN.findOne({
      name: newCategory,
    });
    if (duplicationCheck) {
      res.render("admin/partials/editCategory", {
        session: req.session.admin,
        documentTitle: "Editar categoria",
        errorMessage: "Duplicação de categorias não permitida",
        category: null,
      });
    } else {
      await categoryCLTN.findByIdAndUpdate(req.query.id, req.body)
      req.flash('success_msg', 'Categoria editada com sucesso')
      res.redirect("/admin/categories");
    }
  } catch (error) {
    console.log("Erro ao editar categoria POST: " + error);
    req.flash('error_msg', 'O nome desta categoria já existe')
    res.redirect("/admin/categories");
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.query.id;
    const deleteUser = await categoryCLTN.findByIdAndDelete(categoryId);
    req.flash('success_msg', 'Categoria deletada com sucesso')
    res.redirect("/admin/categories");
  } catch (error) {
    console.log("Erro ao deletar categoria: " + error);
  }
};
