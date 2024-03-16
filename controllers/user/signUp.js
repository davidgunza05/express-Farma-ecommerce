const UserCLTN = require("../../models/user/details");
const CartCLTN = require("../../models/user/cart");
const WishlistCLTN = require("../../models/user/wishlist");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const nodemailer = require("nodemailer");
const { default: mongoose } = require("mongoose");
const Categoria = require("../../models/admin/category");
const categories = Categoria.find({});

exports.signUpPage = (req, res) => {
  try {
    res.render("user/partials/signUp", {
      documentTitle: "Registrar-se",
      details: categories,
    });
  } catch (error) {
    console.log("Erro ao renderizar página de registro: " + error);
  }
};

// Register User
exports.registerUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const newUserDetails = {
      name: req.body.name.trim(),
      number: req.body.number,
      username: req.body.username.replace(/\s+/g, ''),
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
    };

    req.session.newUserDetails = newUserDetails;
    const inputEmail = req.body.email;
    const inputNumber = req.body.number;
    const inputUsername = req.body.username;
    
    const emailCheck = await UserCLTN.findOne({ email: inputEmail });
    const usernameCheck = await UserCLTN.findOne({ username: inputUsername });
    const numberCheck = await UserCLTN.findOne({ number: inputNumber });

    if(inputNumber.length != 9){
      req.flash('error_msg', 'O número de contacto só deve ter 9 caracteres')
      res.redirect("/users/signUp");
    }else{

      if(req.body.confirmar_senha != req.body.password){
        req.flash('error_msg', 'As senhas não são iguais')
        res.redirect("/users/signUp");
      }else{
        if (emailCheck || usernameCheck) {
          res.render("user/partials/signUp", {
            documentTitle: "Registrar-se",
            errorMessager: "Já existe usuário com estes dados, tente novamente com outro nome ou email",
            details: categories,
        }) 
      } else {
  
        const newUserDetails = new UserCLTN(req.session.newUserDetails);
        newUserDetails.save();
        req.flash('success_msg', 'Usuário cadastrado com sucesso!')
        res.redirect("/users/signIn");
  
        const userID = newUserDetails._id;
        const newCart = await new CartCLTN({
          customer: mongoose.Types.ObjectId(userID),
        });
        
        await UserCLTN.findByIdAndUpdate(userID, {
          $set: { cart: mongoose.Types.ObjectId(newCart._id) },
        });
  
        await newCart.save();
        const newWishlist = await new WishlistCLTN({
          customer: mongoose.Types.ObjectId(userID),
        });
  
        await UserCLTN.findByIdAndUpdate(userID, {
          $set: { wishlist: mongoose.Types.ObjectId(newWishlist._id) },
        });
  
        await newWishlist.save();
  
      }
      }

    }
      

  } catch (error) {
      res.redirect("/users/signUp");
      console.log("Error ao salvar usuário: " + error);
  }
};

