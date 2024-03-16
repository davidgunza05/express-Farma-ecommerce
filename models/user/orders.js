const mongoose = require("mongoose");

const orderShema = mongoose.Schema({
  customer: {
    type: mongoose.Types.ObjectId,
    ref: "UserDetails",
  },
  totalQuantity: Number,
  summary: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        ref: "Products",
      },
      quantity: Number,
      totalPrice: Number,
    },
  ],
  shippingAddress: {
    provincia: String,
    municipio: String,
    predio: {
      default: "Não mora em edifício", 
      type: String,
    },
    bairro: String,
    pincode: Number,
    contacto: Number,
  },
  delivered: { type: Boolean, default: false },
  status: {
    type: String,
    default: "Processando",
  },
  modeOfPayment: String,
  couponUsed: { type: mongoose.Types.ObjectId, ref: "Coupon" },
  price: Number,
  finalPrice: Number,
  discountPrice: { type: Number, default: 0 },
  orderedOn: { type: Date, default: Date.now() },
  deliveredOn: { type: Date, default: null },
});

const orderCLTN = mongoose.model("Orders", orderShema);
module.exports = orderCLTN;