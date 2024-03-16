const UserCLTN = require("../../models/user/details");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer')
const Categoria = require("../../models/admin/category");
const categories = Categoria.find({});  

exports.Page = (req, res) => {
  try {
    res.render("user/partials/forgotPassword", {
      documentTitle: "Esqueci a senha",
      details: categories,
    });
  } catch (error) {
    console.log('Erro ao renderizar página de esqueceu a senha: ' + error)
  }
};

exports.emailVerification = async (req, res) => {
  const inputEmail = req.body.email;
  const mailChecker = await UserCLTN.findOne({ email: inputEmail });
  if (mailChecker) {
    const tempOTP = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
    req.session.resetPasswordAuth = inputEmail;
    // Transporter
    const transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.TRANSPORTER_USERNAME,
        pass: process.env.TRANSPORTER_PASSWORD,
      },
    });

    // Mail options
    const mailOptions = await {
      from: process.env.TRANSPORTER_USERNAME,
      to: inputEmail,
      subject: "OTP para recuperar senha | eFarma",
      html: `<h1>OTP</h1></br><h2 style="text-color: red, font-weight: bold">${tempOTP}</h2></br><p>Insira o OTP para criar a conta.</p>`,
    };

    // Send maildocumentTitle
    await transporter.sendMail(mailOptions);
    req.session.resetOTP = tempOTP;
    console.log("User Reset OTP Sent: " + req.session.resetOTP);
    req.flash('success_msg', 'Senha de usuário atualizado')
    res.redirect("/users/forgotPassword/otpVerification");
  } else {
    res.render("user/partials/forgotPassword", {
      documentTitle: "Esqueci a senha",
      details: categories,
      session: req.session.userID,
      errorMessage: "Nenhuma conta com este email",
    });
  }
};

exports.otpPage = (req, res) => {
  if (req.session.resetPasswordAuth && req.session.resetOTP) {
    res.render("user/partials/otp", {
      documentTitle: "Esqueci a senha",
      details: categories,
    });
  } else {
    res.redirect("/users/signIn");
  }
}; 

exports.otpVerification = (req, res) => {
  if (req.session.resetPasswordAuth && req.session.resetOTP) {
    const inputOTP = req.body.otp;
    const resetOTP = req.session.resetOTP;
    if (inputOTP == resetOTP) {
      req.session.resetOTP = false;
      req.session.updatePassword = true;
      console.log("Session created for user password change");
      res.redirect("/users/changePassword");
    } else {
      res.render("user/partials/otp", {
        documentTitle: "Esqueci a senha",
        details: categories,
        errorMessage: "Código OTP Inválido",
      });
    }
  } else {
    res.redirect("/users/signIn");
  }
};


exports.passwordChangePage = (req, res) => {
  res.render("user/partials/changePassword", {
    documentTitle: "Esqueci a senha",
    details: categories,
  });
};

exports.updatePassword = async (req, res) => {
  const mongoose = require('mongoose');
  const bcrypt = require('bcrypt');

  const { username, currentPassword, newPassword, confirmPassword} = req.body;

  try {
    // Busca o usuário no banco de dados
    const user = await UserCLTN.findOne({ username });

    // Verifica se a senha atual está correta
    const isPasswordCorrect = bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      req.flash('error_msg', 'Senha atual incorreta')
      res.redirect("/users/changePassword");
    }

    // Gera o hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha no banco de dados
    await UserCLTN.updateOne({ username }, { password: hashedPassword });
    req.flash('error_msg', 'Senha alterada com sucesso')
    res.redirect("/users/perfil");
  } catch (error) {
    console.error(error);
    res.send('Ocorreu um erro ao alterar a senha');
  }
};

