const Transaction = require('../models/Transaction');
const Agent = require('../models/Agent');

// Générer une référence lisible: DEP-YYYYMMDD-XXXXXX
const generateRef = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `DEP-${y}${m}${day}-${rand}`;
};

// Créer une transaction (augmenter le solde du distributeur)
exports.creerTransaction = async (req, res) => {
  try {
    // Accepter numeroCompte (frontend) et numeroCompteDistributeur (backend)
    const numeroCompteDistributeur = req.body.numeroCompteDistributeur || req.body.numeroCompte;
    const { montant } = req.body;
    const agentId = req.agentId;

    if (!numeroCompteDistributeur || !montant) {
      return res.status(400).json({ 
        message: 'Le numéro de compte du distributeur et le montant sont requis' 
      });
    }

    // Vérifier que l'agent existe et est un Distributeur
    const distributeur = await Agent.findOne({ 
      numeroCompte: numeroCompteDistributeur,
      role: 'Distributeur'
    });

    if (!distributeur) {
      return res.status(404).json({ 
        message: 'Distributeur non trouvé avec ce numéro de compte' 
      });
    }

    // (Optionnel) vérifier un statut sur Agent si nécessaire

    // Augmenter le solde du distributeur (Agent)
    distributeur.solde += montant;
    await distributeur.save();

    // Créer la transaction
    const transaction = await Transaction.create({
      agent: agentId,
      reference: generateRef(),
      numeroCompteDistributeur,
      montant,
      statut: 'effectuee',
      dateEnvoi: new Date()
    });

    const transactionPopulee = await Transaction.findById(transaction._id)
      .populate('agent', 'prenom nom email');

    res.status(201).json({
      message: 'Transaction effectuée avec succès',
      transaction: transactionPopulee,
      destinataire: {
        prenom: distributeur.prenom,
        nom: distributeur.nom,
        numeroCompte: distributeur.numeroCompte,
        telephone: distributeur.telephone || '',
        solde: distributeur.solde
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
};

// Annuler une transaction (dépôt) pour un Agent Distributeur
exports.annulerTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }
    if (transaction.statut === 'annulee') {
      return res.status(400).json({ message: 'Cette transaction est déjà annulée' });
    }

    // Récupérer le distributeur (Agent)
    const distributeur = await Agent.findOne({ 
      numeroCompte: transaction.numeroCompteDistributeur,
      role: 'Distributeur',
    });
    if (!distributeur) {
      return res.status(404).json({ message: 'Distributeur non trouvé pour cette transaction' });
    }

    // Vérifier que le distributeur a assez de solde pour restituer
    if (Number(distributeur.solde) < Number(transaction.montant)) {
      return res.status(400).json({ message: 'Solde insuffisant du distributeur pour annuler cette transaction' });
    }

    // Restituer: diminuer le solde du distributeur
    distributeur.solde = Number(distributeur.solde) - Number(transaction.montant);
    await distributeur.save();

    // Marquer la transaction comme annulée
    transaction.statut = 'annulee';
    await transaction.save();

    const transactionPopulee = await Transaction.findById(transaction._id).populate('agent', 'prenom nom email');

    res.status(200).json({
      message: 'Transaction annulée avec succès',
      transaction: transactionPopulee,
      nouveauSoldeDistributeur: distributeur.solde,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'annulation', error: error.message });
  }
};

// Obtenir toutes les transactions
exports.obtenirTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('agent', 'prenom nom email')
      .sort({ dateEnvoi: -1 });

    res.status(200).json({ 
      transactions,
      total: transactions.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération', 
      error: error.message 
    });
  }
};

// Obtenir une transaction par ID
exports.obtenirTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('agent', 'prenom nom email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    res.status(200).json({ transaction });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération', 
      error: error.message 
    });
  }
};

// Obtenir les transactions d'un agent spécifique
exports.obtenirTransactionsAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    const transactions = await Transaction.find({ agent: agentId })
      .populate('agent', 'prenom nom email')
      .sort({ dateEnvoi: -1 });

    res.status(200).json({ 
      transactions,
      total: transactions.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération', 
      error: error.message 
    });
  }
};

// Obtenir les transactions d'un distributeur
exports.obtenirTransactionsDistributeur = async (req, res) => {
  try {
    const { numeroCompte } = req.params;

    const transactions = await Transaction.find({ 
      numeroCompteDistributeur: numeroCompte 
    })
    .populate('agent', 'prenom nom email')
    .sort({ dateEnvoi: -1 });

    res.status(200).json({ 
      transactions,
      total: transactions.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération', 
      error: error.message 
    });
  }
};