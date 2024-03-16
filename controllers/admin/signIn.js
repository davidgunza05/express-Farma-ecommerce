const adminCLTN = require("../../models/admin/details");
const bcrypt = require("bcrypt");

exports.page = (req, res) => {
  try {
    res.render("admin/partials/signIn", {
      documentTitle: "Entrar como Admin",
    });
  } catch (error) {
    console.log("Erro ao renderizar para a página de login do admin: " + error);
  }
};

exports.verification = async (req, res) => {
  try {
    const inputUsername = req.body.username;
    const inputPassword = req.body.password;
    const adminFind = await adminCLTN.findOne({ username: inputUsername });
    if (adminFind) {
      const hashedCheck = await bcrypt.compare(
        inputPassword,
        adminFind.password
      );
      if (hashedCheck) {
        req.session.admin = req.body.username;
        res.redirect("/admin/dashboard");
      } else {
        res.render("admin/partials/signIn", {
          documentTitle: "Entrar como admin",
          errorMessage: "Senha incorreta",
        });
      }
    } else {
      res.render("admin/partials/signIn", {
        documentTitle: "Entrar como admin",
        errorMessage: "Admin não encontrado",
      });
    }
  } catch (error) {
    console.log("Erro no login do admin: " + error);
  }
};



