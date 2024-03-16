const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    number: {
      type: Number,
    },
    email: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
      unique: true,
    },
    eAdmin: {
      type: String,
      default: 0,
    },
    photo: {
      type: String,
      default: "default_userPhoto.jpg", 
    },
    password: {
      type: String,
    },
    access: {
      type: Boolean,
      default: true,
    },
    addresses: [
      {
        provincia: String,
        municipio: String,
        predio: {
          default: "Não mora em edifício", 
          type: String,
        },
        bairro: String,
        pincode: Number,
        contacto: Number,
        primary: Boolean,
      },
    ],
    cart: {
      type: mongoose.Types.ObjectId,
      ref: "Cart",
    },
    wishlist: {
      type: mongoose.Types.ObjectId,
      ref: "Wishlist",
    },
    orders: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Orders",
      },
    ],
    couponsUsed: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Coupon",
      },
    ],
  },
  { timestamps: true }
);

const UserCLTN = mongoose.model("UserDetails", userSchema);

module.exports = UserCLTN;