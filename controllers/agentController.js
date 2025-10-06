const Agent = require('../models/Agent');
const jwt = require('jsonwebtoken');

// Helper: générer un numéro de compte si absent
const generateNumeroCompte = () => `AC${Math.floor(100000 + Math.random() * 900000)}`;

// Créer un agent
exports.creerAgent = async (req, res) => {
  try {
    const { prenom, nom, email, password, solde, role, telephone, numeroCompte } = req.body;

    const agentExiste = await Agent.findOne({ email });
    if (agentExiste) {
      return res.status(400).json({ message: 'Cet email existe déjà' });
    }

    const agent = await Agent.create({
      prenom,
      nom,
      email,
      password,
      solde: solde || 0,
      role: role || 'Client',
      telephone: telephone || '',
      numeroCompte: numeroCompte || generateNumeroCompte(),
    });

    const agentSansPassword = agent.toObject();
    delete agentSansPassword.password;

    res.status(201).json({
      message: 'Agent créé avec succès',
      agent: agentSansPassword,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création', error: error.message });
  }
};

// DEV: réinitialiser le mot de passe d'un agent via email + token admin
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, token } = req.body || {};
    if (!email || !newPassword || !token) {
      return res.status(400).json({ message: 'email, newPassword et token requis' });
    }
    const expected = process.env.RESET_ADMIN_TOKEN || '';
    if (!expected || token !== expected) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();
    const agent = await Agent.findOne({ email: normalizedEmail }).select('+password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent non trouvé' });
    }
    agent.password = newPassword; // sera hashé par pre('save')
    await agent.save();

    const agentSansPassword = agent.toObject();
    delete agentSansPassword.password;
    return res.status(200).json({ message: 'Mot de passe réinitialisé', agent: agentSansPassword });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la réinitialisation', error: error.message });
  }
};

// Modifier un agent (sauf password)
exports.modifierAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { prenom, nom, email, solde, role, telephone, numeroCompte } = req.body;

    const updateData = {};
    if (prenom !== undefined) updateData.prenom = prenom;
    if (nom !== undefined) updateData.nom = nom;
    if (email !== undefined) updateData.email = email;
    if (solde !== undefined) updateData.solde = solde;
    if (role !== undefined) updateData.role = role;
    if (telephone !== undefined) updateData.telephone = telephone;
    if (numeroCompte !== undefined) updateData.numeroCompte = numeroCompte;

    const agent = await Agent.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent non trouvé' });
    }

    res.status(200).json({ message: 'Agent modifié avec succès', agent });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la modification', error: error.message });
  }
};

// Login agent
exports.loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const agent = await Agent.findOne({ email }).select('+password');

    let valid = false;
    if (agent) {
      try {
        valid = await agent.comparePassword(password);
      } catch (_) {}
      // Fallback dev: mot de passe en clair (si données legacy non hashées)
      if (!valid && process.env.DEV_PLAINTEXT_LOGIN === 'true') {
        if (agent.password === password) valid = true;
      }
    }
    if (!agent || !valid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: agent._id, email: agent.email },
      process.env.JWT_SECRET || 'votre_secret_jwt_super_secret',
      { expiresIn: '24h' }
    );

    const agentSansPassword = agent.toObject();
    delete agentSansPassword.password;

    res.status(200).json({
      message: 'Connexion réussie',
      token,
      agent: agentSansPassword
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
};

// Obtenir tous les agents
exports.obtenirAgents = async (req, res) => {
  try {
    let agents = await Agent.find().select('-password');
    // Backfill: si certains champs manquent, les ajouter et sauvegarder
    const updates = [];
    for (const a of agents) {
      let changed = false;
      if (!a.role) { a.role = 'Client'; changed = true; }
      if (a.telephone === undefined) { a.telephone = ''; changed = true; }
      if (!a.numeroCompte) { a.numeroCompte = generateNumeroCompte(); changed = true; }
      if (changed) updates.push(a.save());
    }
    if (updates.length) {
      await Promise.all(updates);
      agents = await Agent.find().select('-password');
    }
    res.status(200).json({ agents });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération', error: error.message });
  }
};
// Obtenir un agent par ID
exports.obtenirAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent non trouvé' });
    }
    return res.status(200).json({ agent });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération', error: error.message });
  }
};

// Upload photo de profil d'un agent (multer place le fichier dans uploads/)
exports.uploadPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni (champ attendu: 'photo')" });
    }
    const relativePath = `/uploads/${req.file.filename}`;
    const agent = await Agent.findByIdAndUpdate(
      id,
      { photoUrl: relativePath },
      { new: true, runValidators: true }
    ).select('-password');

    if (!agent) {
      return res.status(404).json({ message: 'Agent non trouvé' });
    }

    return res.status(200).json({
      message: 'Photo mise à jour avec succès',
      photoUrl: relativePath,
      agent,
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors du téléversement", error: error.message });
  }
};