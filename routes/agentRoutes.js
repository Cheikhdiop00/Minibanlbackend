const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const agentController = require('../controllers/agentController');//
const { protegerRoute } = require('../middleware/auth');

// Config upload dossier
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});
const upload = multer({ storage });

// Routes publiques
router.post('/login', agentController.loginAgent);

// Routes protégées
router.post('/', agentController.creerAgent);
router.get('/',  agentController.obtenirAgents);
router.get('/:id',  agentController.obtenirAgent);
router.put('/:id', agentController.modifierAgent);

// Upload photo de profil (champ: 'photo')
router.put('/:id/photo', upload.single('photo'), agentController.uploadPhoto);

module.exports = router;