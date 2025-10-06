require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

// Création de l'application Express
const app = express();

// Middleware
app.use(cors()); // ✅ après la création de app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à la base de données
connectDB();

// Importation des routes
const agentRoutes = require('./routes/agentRoutes');
const utilisateurRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Routes
app.use('/api/agents', agentRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/transactions', transactionRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de gestion des agents et utilisateurs',
    version: '1.0.0',
    endpoints: {
      agents: '/api/agents',
      utilisateurs: '/api/utilisateurs',
      transactions: '/api/transactions'
    }
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
});
