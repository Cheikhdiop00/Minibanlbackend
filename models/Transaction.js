// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: [true, 'L\'ID de l\'agent est requis']
  },
  // Référence lisible par l'humain pour tracer la transaction
  reference: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  numeroCompteDistributeur: {
    type: String,
    required: [true, 'Le numéro de compte du distributeur est requis']
  },
  montant: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0, 'Le montant doit être positif']
  },
  statut: {
    type: String,
    enum: ['effectuee', 'annulee'],
    default: 'effectuee'
  },
  dateEnvoi: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);