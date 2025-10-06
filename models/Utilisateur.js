// models/Utilisateur.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const utilisateurSchema = new mongoose.Schema({
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
  adresse: {
    type: String,
    required: [true, 'L\'adresse est requise'],
    trim: true
  },
  dateNaissance: {
    type: Date,
    required: [true, 'La date de naissance est requise']
  },
  numeroCompte: {
    type: String,
    required: [true, 'Le numéro de compte est requis'],
    unique: true,
    trim: true
  },
  solde: {
    type: Number,
    default: 0,
    min: 0
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
    select: false
  },
  statut: {
    type: String,
    enum: ['actif', 'bloque'],
    default: 'actif'
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est requis'],
    unique: true,
    trim: true
  },
  cni: {
    type: String,
    required: [true, 'Le CNI est requis'],
    unique: true,
    trim: true
  },
  typeUtilisateur: {
    type: String,
    enum: ['client', 'distributeur'],
    required: [true, 'Le type d\'utilisateur est requis']
  },
  creePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  }
}, {
  timestamps: true
});

utilisateurSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('Utilisateur', utilisateurSchema);

