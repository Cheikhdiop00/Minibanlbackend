const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protegerRoute } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(protegerRoute);

router.post('/', transactionController.creerTransaction);
router.get('/', transactionController.obtenirTransactions);
router.get('/:id', transactionController.obtenirTransaction);
router.patch('/:id/annuler', transactionController.annulerTransaction);
router.get('/agent/:agentId', transactionController.obtenirTransactionsAgent);
router.get('/distributeur/:numeroCompte', transactionController.obtenirTransactionsDistributeur);

module.exports = router;