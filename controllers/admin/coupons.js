const couponCLTN = require("../../models/admin/coupons");
const moment = require("moment");
moment.locale('pt-br');

exports.page = async (req, res) => {
  try {
    const coupons = await couponCLTN.find();
    res.render("admin/partials/coupons", {
      session: req.session.admin,
      documentTitle: "Gerenciamento de desconto",
      coupons,
      moment,
    });
  } catch (error) {
    console.log("Erro ao renderizar página de código de descontos: " + error);
  }
};

const data = Date() 

exports.addNew = async (req, res) => {
  try { 
    const newCoupon = new couponCLTN({
      name: req.body.name,
      code: req.body.code,
      discount: req.body.discount,
      startingDate: req.body.startingDate,
      expiryDate: req.body.expiryDate,
    });
    
    if(req.body.startingDate > req.body.expiryDate){
      req.flash('error_msg', 'Data de expiração deve ser maior que a data de começo e as duas datas devem ser maior que a data atual')
      res.redirect("/admin/coupon_management");
    }else{
      await newCoupon.save();
      res.redirect("/admin/coupon_management");
    }

  } catch (error) {
    console.log("Erro ao adicionar página de desconto: " + error);
  }
};

exports.changeActivity = async (req, res) => {
  try {
    const currentCoupon = await couponCLTN.findById(req.query.id);
    let currentActivity = currentCoupon.active;
    if (currentActivity == true) {
      currentActivity = false;
    } else {
      currentActivity = true;
    }
    currentActivity = Boolean(currentActivity);
    await couponCLTN.findByIdAndUpdate(currentCoupon._id, {
      $set: { active: currentActivity },
    });
    res.redirect("/admin/coupon_management");
  } catch (error) {
    console.log("Erro ao mudar atividade do código de desconto: " + error);
  }
};


exports.deleteCoupon = async (req, res) => {
  try {
    const couponId = req.query.id;
    const deleteUser = await couponCLTN.findByIdAndDelete(couponId);
    req.flash('success_msg', 'Descononto deletado com sucesso')
    res.redirect("/admin/coupon_management");
  } catch (error) {
    console.log("Erro ao deletar desconto: " + error);
  }
};