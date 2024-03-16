const mongoose = require("mongoose");
const categoryCLTN = require("./category");

const blogSchema = new mongoose.Schema({
  titulo: {
    type: String,
    require,
  },
  data: Date,
  category: {
    type: mongoose.Types.ObjectId,
    ref: categoryCLTN,
    require,
  },  
  imageblog: {
    type: String,
    require,
  }, 
  reviews: [{
    user: String, 
    email: String,
    comment: String
  }], 
  listed: { 
    type: Boolean, 
    default: true 
  },
  conteudo1: String, 
  conteudo2: String,   
});

const blogCLTN = mongoose.model("Blog", blogSchema);
module.exports = blogCLTN;
