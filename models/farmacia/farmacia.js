const mongoose = require('mongoose');

const farmaciaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  endereco: {
    type: String,
    required: true
  },
  provincia: {
    type: String,
    required: true
  },
  municipio: {
    type: String,
    required: true
  },
  bairro: {
    type: String,
    required: true
  },
  rua: {
    type: String,
    required: true
  },
  cep: {
    type: String,
    required: true
  },
  localizacao: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

const Farmacia = mongoose.model('Farmacia', farmaciaSchema);

module.exports = Farmacia;
