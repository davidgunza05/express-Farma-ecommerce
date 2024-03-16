const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
});

const adminCLTN = mongoose.model("admindetails", adminSchema);

module.exports = adminCLTN; 