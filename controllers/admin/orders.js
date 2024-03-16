const orderCLTN = require("../../models/user/orders");
const moment = require("moment");
moment.locale('pt-br');
exports.viewAll = async (req, res) => {
  try {
    const allOrders = await orderCLTN
      .find()
      .populate("customer", "name email")
      .populate("couponUsed", "name")
      .populate("summary.product", "category name brand price")
      .populate("summary.product.category")
      .sort({ _id: -1 })

    res.render("admin/partials/orders", {
      allOrders,
      documentTitle: "Gerenciamento de pedidos",
      moment,
      session: req.session.admin,
    });
  } catch (error) {
    console.log("Erro ao renderizar todos pedidos: " + error);
  }
};

exports.deliver = async (req, res) => {
  try {
    await orderCLTN.findByIdAndUpdate(req.body.orderID, {
      $set: {
        delivered: true,
        deliveredOn: Date.now(),
      },
    });
    res.json({
      data: { delivered: 1 },
    });
  } catch (error) {
    console.log("Erro ao entregar o pedidod: " + error);
  }
};

exports.details = async (req, res) => {
  try { 
    const currentOrder = await orderCLTN
      .findById(req.params.id)
      .populate("summary.product")
      .populate("couponUsed")
      .populate("customer", "name email")
    res.render("admin/partials/orderDetails", {
      session: req.session.admin,
      currentOrder,
      moment,
      documentTitle: "Detalhes do pedido",
    });
  } catch (error) {
    console.log("Erro ao renderizar detalhe de pedido: " + error);
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderrId = req.query.id;
    const deleteUser = await orderCLTN.findByIdAndDelete(orderrId);
    req.flash('success_msg', 'Pedido deletado com sucesso')
    res.redirect("/admin/orders");
  } catch (error) {
    console.log("Erro ao deletar pedido: " + error);
  }
};