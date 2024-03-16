exports.signOut = (req, res) => {
  try {
    res.session.destroy();
    req.flash('success_msg', 'Sessão termina')
    res.redirect("/admin");
  } catch (error) {
    console.log("Erro ao termina sessão de admin: " + error);
  }
};
