const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/userController');
const { protegerRoute } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(protegerRoute);

router.post('/', utilisateurController.creerUtilisateur);
router.get('/', utilisateurController.obtenirUtilisateurs);
router.get('/:id', utilisateurController.obtenirUtilisateur);
router.put('/:id', utilisateurController.modifierUtilisateur);
router.patch('/:id/bloquer', utilisateurController.bloquerUtilisateur);
router.delete('/:id', utilisateurController.supprimerUtilisateur);

module.exports = router;