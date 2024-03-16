const UserCLTN = require("../../models/user/details");
const Categoria = require("../../models/admin/category");

exports.viewAll = async (req, res) => {
  try { 
    const categories = await Categoria.find({});
    const userID = req.session.userID;
    const currentUser = await UserCLTN.findById(userID);
    let allAddresses = currentUser.addresses;
    if (allAddresses == "") {
      allAddresses = null;
    }
    res.render("user/profile/partials/address", {
      documentTitle: "Meu endereço",
      allAddresses,
      session: req.session.userID,
      details: categories,
      currentUser,
    });
  } catch (error) {
    console.log("Erro ao listar todos endereços: " + error);
  }
};

exports.addNew = async (req, res) => {
  try {
    const userID = req.session.userID;
    await UserCLTN.updateMany(
      { _id: userID, "addresses.primary": true },
      { $set: { "addresses.$.primary": false } }
    );
    await UserCLTN.updateOne(
      { _id: userID },
      {
        $push: {
          addresses: {
            provincia: req.body.provincia,
            municipio: req.body.municipio,
            predio: req.body.predio,
            bairro: req.body.bairro,
            pincode: req.body.pincode,
            contacto: req.body.contacto,
            primary: true,
          },
        },
      }
    );
    res.redirect("/users/addresses");
  } catch (error) {
    console.log("Erro ao adicionar novo endereço: " + error);
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const userID = req.session.userID;
    const addressID = req.query.addressID;
    await UserCLTN.updateOne(
      { _id: userID },
      { $pull: { addresses: { _id: addressID } } }
    );
    res.redirect("/users/addresses");
  } catch (error) {
    console.log("Erro ao deletar endereço: " + error);
  }
};

exports.defaultToggler = async (req, res) => {
  try {
    const userID = req.session.userID;
    const currentAddressID = req.query.addressID;
    await UserCLTN.updateMany(
      { _id: userID, "addresses.primary": true },
      { $set: { "addresses.$.primary": false } }
    );
    await UserCLTN.updateOne(
      { _id: userID, "addresses._id": currentAddressID },
      { $set: { "addresses.$.primary": true } }
    );
    res.redirect("/users/addresses");
  } catch (error) {
    console.log("Erro ao mudar endereço padrão: " + error);
  }
};
