const mongoose = require('mongoose');

const ContactoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  msg: {
    type: String,
    required: true
  },
  resposta: {
    type: String,
    default: 'Sem resposta ainda'
  },
  date: {
    type: Date,
    default: Date.now()
  }, 
  image: {
    type: String,
  },
});

const contactoCLTN = mongoose.model('Contacto', ContactoSchema);

module.exports = contactoCLTN;
