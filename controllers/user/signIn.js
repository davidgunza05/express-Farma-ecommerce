const bcrypt = require("bcrypt");
const UserCLTN = require("../../models/user/details");
const Categoria = require("../../models/admin/category");
const categories = Categoria.find({});

exports.signInPage = (req, res) => {
  try {
    if (req.session.userID) {
      res.redirect("/");
    } else {
      res.render("user/partials/signIn", {
        documentTitle: "Página de login",
        details: categories,
        session: null,
      });
    }
  } catch (error) {
    console.log("Erro ao renderizar página de login: " + error);
  }
};

exports.userVerification = async (req, res) => {
  try {
    const inputUsername = req.body.username;
    const inputPassword = req.body.password;
    const userFind = await UserCLTN.findOne({ username: inputUsername });
    if (userFind) {
      const hashedCheck = await bcrypt.compare(
        inputPassword,
        userFind.password
      );
      if (userFind.access == true) {
        if (hashedCheck) {
          req.session.userID = userFind._id;
          res.redirect("/");
        } else {
          res.render("user/partials/signIn", {
            documentTitle: "Página de login",
            details: categories,
            errorMessage: "Senha icncorreta para esta conta",
          });
        }
      } else {
        res.render("user/partials/signIn", {
          documentTitle: "Página de login",
          details: categories,
          errorMessage: "A sua conta foi bloqueada entre em contacto connosco",
        });
      }
    } else {
      res.render("user/partials/signIn", {
        documentTitle: "Página de login",
        details: categories,
        errorMessage: "Usuário não encontrado",
      });
    }
  } catch (error) {
    console.log("Erro no login do usuário: " + error);
  }
};
