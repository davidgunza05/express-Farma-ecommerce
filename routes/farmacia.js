const express = require('express');
const router = express.Router();
const Farmacia = require('../models/farmacia');

// Rota para exibir a página de farmácias
router.get('/farmacias', async (req, res) => {
  const farmacias = await Farmacia.find();
  res.render('farmacias', { farmacias });
});

module.exports = router;
