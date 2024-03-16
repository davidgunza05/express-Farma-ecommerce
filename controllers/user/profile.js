const { findById } = require("../../models/user/details");
const UserCLTN = require("../../models/user/details");
const mongoose = require("mongoose");
const Categoria = require("../../models/admin/category");
      

exports.page = async (req, res) => {
  try {
    const userID = req.session.userID;
    const categories = await Categoria.find({});

    const currentUser = await UserCLTN.findById(userID);
    const defaultAddress = await UserCLTN.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(userID),
        },
      },
      {
        $unwind: "$addresses",
      },
      {
        $match: {
          "addresses.primary": true,
        },
      },
    ]);
    res.render("user/profile/partials/profile", {
      documentTitle: "Meu perfil",
      currentUser,
      details: categories,
      session: req.session.userID,
      defaultAddress,
    });
  } catch (error) {
    console.log("Erro ao renderizar página de login: " + error);
  }
};

exports.update = async (req, res) => {
  try {
    const userID = req.session.userID;
    const newName = req.body.name;
    const filteredBody = { name: newName };
    if (req.file) {
      filteredBody.photo = req.file.filename;
    }
    await UserCLTN.findByIdAndUpdate(userID, filteredBody);
    res.redirect("/users/profile");
  } catch (error) {
    console.log("Erro ao atualizar detalhes do usuário: " + error);
  }
};
