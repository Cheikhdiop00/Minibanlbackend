// models/Agent.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const agentSchema = new mongoose.Schema({
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
    select: false
  },
  // Nouveau: rôle de l'agent/utilisateur
  role: {
    type: String,
    enum: ['Client', 'Distributeur', 'Agent'],
    default: 'Client',
    trim: true
  },
  // Nouveau: téléphone
  telephone: {
    type: String,
    trim: true,
    default: ''
  },
  // Nouveau: numéro de compte (unique s'il est défini)
  numeroCompte: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // permet plusieurs docs sans numeroCompte
    default: ''
  },
  solde: {
    type: Number,
    default: 0,
    min: 0
  },
  // URL de la photo de profil (persistée côté serveur)
  photoUrl: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

agentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

agentSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Agent', agentSchema);