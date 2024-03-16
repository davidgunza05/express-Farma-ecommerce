const moment = require("moment/moment");
const orderCLTN = require("../../models/user/orders");
const Categoria = require("../../models/admin/category");
const UserCLTN = require("../../models/user/details");
moment.locale('pt-br');

exports.viewAll = async (req, res) => {
  try { 
    const categories = await Categoria.find({});
    const userID = req.session.userID;
    const currentUser = await UserCLTN.findById(userID);

    const allOrders = await orderCLTN
      .find({
        customer: req.session.userID,
      })
      .sort({ _id: -1 })
      .populate("customer")
      .populate("couponUsed");
    res.render("user/profile/partials/orders", {
      documentTitle: "Minhas compras",
      allOrders,
      session: req.session.userID,
      moment,
      details: categories,
      currentUser,
    });
  } catch (error) {
    console.log("Erro ao renderizar página de pedidos: " + error);
  }
};

exports.details = async (req, res) => {
  try {
    const userID = req.session.userID;
    const currentUser = await UserCLTN.findById(userID);
    const currentOrder = await orderCLTN
      .findById(req.params.id)
      .populate("summary.product")
      .populate("customer", "name email")
      .populate("couponUsed")
      .sort("");
    const categories = await Categoria.find({});

    if (currentOrder) {
      res.render("user/profile/partials/orderDetails", {
        documentTitle: "Detalhe de pedido",
        currentOrder,
      session: req.session.userID,
      moment,
      details: categories,
      currentUser,
      });
    } else {
      res.redirect("/pageNotFound");
    }
  } catch (error) {
    console.log("Erro ao mostrar resultados do pedido: " + error);
  }
};

exports.cancel = async (req, res) => {
  await orderCLTN.findByIdAndUpdate(req.params.id, {
    $set: {
      status: 'Cancelled',
      deliveredOn: null
    }
  })
  res.json({
    success: 'cancelled'
  })
}