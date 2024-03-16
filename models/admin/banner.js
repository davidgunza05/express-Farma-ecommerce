const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: String,
    image: String,
    description: String, 
    active: {
      type: Boolean,
      default: true,
    },
    url: String,
  }, 
);

const BannerCLTN = mongoose.model("Banner", bannerSchema);
module.exports = BannerCLTN;
