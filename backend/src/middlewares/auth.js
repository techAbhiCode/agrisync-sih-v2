const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('../../config/serviceAccountKey.json');

// Initialize Admin SDK with the new modular syntax
initializeApp({
  credential: cert(serviceAccount)
});

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access Denied. No token provided.' });
  }

  try {
    // Verify token using modern getAuth()
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken; // Inject user details into the request
    next();
  } catch (error) {
    console.error('Firebase Auth Error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;