const sessionCheck = (req, res, next) => {
    if (req.session.userID) {
        next()
    } else {
        res.redirect('/users/signIn')
        req.flash('error_msg', 'Inicia sessão para acessar rotas de usuário!')
    }
}

module.exports = sessionCheck;