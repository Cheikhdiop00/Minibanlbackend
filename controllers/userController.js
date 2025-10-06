const Utilisateur = require('../models/Utilisateur');

// Créer un utilisateur (client ou distributeur)
exports.creerUtilisateur = async (req, res) => {
  try {
    const {
      prenom, nom, email, adresse, dateNaissance,
      numeroCompte, solde, password, telephone, cni, typeUtilisateur
    } = req.body;

    // Vérifier si l'email, téléphone ou CNI existent déjà
    const emailExiste = await Utilisateur.findOne({ email });
    if (emailExiste) {
      return res.status(400).json({ message: 'Cet email existe déjà' });
    }

    const telephoneExiste = await Utilisateur.findOne({ telephone });
    if (telephoneExiste) {
      return res.status(400).json({ message: 'Ce numéro de téléphone existe déjà' });
    }

    const cniExiste = await Utilisateur.findOne({ cni });
    if (cniExiste) {
      return res.status(400).json({ message: 'Ce CNI existe déjà' });
    }

    const utilisateur = await Utilisateur.create({
      prenom,
      nom,
      email,
      adresse,
      dateNaissance,
      numeroCompte,
      solde: solde || 0,
      password,
      telephone,
      cni,
      typeUtilisateur,
      creePar: req.agentId // ID de l'agent connecté
    });

    const utilisateurSansPassword = utilisateur.toObject();
    delete utilisateurSansPassword.password;

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      utilisateur: utilisateurSansPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création', error: error.message });
  }
};

// Modifier un utilisateur
exports.modifierUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Empêcher la modification du password via cette route
    delete updateData.password;
    delete updateData.creePar;

    const utilisateur = await Utilisateur.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      message: 'Utilisateur modifié avec succès',
      utilisateur
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la modification', error: error.message });
  }
};

// Bloquer un utilisateur
exports.bloquerUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findByIdAndUpdate(
      id,
      { statut: 'bloque' },
      { new: true }
    ).select('-password');

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      message: 'Utilisateur bloqué avec succès',
      utilisateur
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du blocage', error: error.message });
  }
};

// Supprimer un utilisateur
exports.supprimerUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findByIdAndDelete(id);

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
};

// Obtenir tous les utilisateurs
exports.obtenirUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find()
      .select('-password')
      .populate('creePar', 'prenom nom email');
    res.status(200).json({ utilisateurs });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération', error: error.message });
  }
};

// Obtenir un utilisateur par ID
exports.obtenirUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id)
      .select('-password')
      .populate('creePar', 'prenom nom email');
    
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.status(200).json({ utilisateur });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération', error: error.message });
  }
};