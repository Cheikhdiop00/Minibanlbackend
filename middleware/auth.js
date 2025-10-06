const jwt = require('jsonwebtoken');

exports.protegerRoute = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'Non autorisé. Veuillez vous connecter.' 
      });
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'votre_secret_jwt_super_secret'
    );

    req.agentId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Token invalide ou expiré', 
      error: error.message 
    });
  }
};