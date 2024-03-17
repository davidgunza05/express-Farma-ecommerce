require("dotenv").config();
const express = require("express");
const app = express();
const flash = require('connect-flash');
 
// Path
const path = require("path");

// View Engine 0848 4025
app.set("view engine", "ejs");

// Database
require("./config/db");

// Session
const session = require("express-session");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: "E-Farma-Session",
    resave: false, 
    saveUninitialized: true,
    cookie: { secure: false },
  }) 
);

app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  next()
})
// To create req object
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Path
app.use(express.static(path.join(__dirname, "public")));

// Routes
const indexRouter = require("./routes/index");
app.use("/", indexRouter);

const userRouter = require("./routes/user");
app.use("/users", userRouter);

const adminRouter = require("./routes/admin");
app.use("/admin", adminRouter);

// 404 Rendering
const UserCLTN = require("./models/user/details");
const Categoria = require("./models/admin/category");

app.all("*", async (req, res) => {
  res.render("index/404");
});

// Create Server
const PORT = process.env.PORT;
app.listen(PORT, (err) => {  
  if (err) {
    console.log("Erro ao iniciar servidor: " + err);
  } else {
    console.log("Servidor rodando em https://localhost:3000");
  }
});