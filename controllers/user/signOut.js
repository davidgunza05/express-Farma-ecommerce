exports.signOut = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log("Erro ao terminar sessão: " + error);
  }
};

