const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("strictQuery", true);

mongoose.connect(
  process.env.mongoDB_URL,
  {
    useNewUrlParser: true,
  },
  (err) => {
    if (!err) {
      console.log("Conectdo a base de dados..!");
    } else {
      console.log("Erro ao conectar a base de dados: " + err);
    }
  }
);