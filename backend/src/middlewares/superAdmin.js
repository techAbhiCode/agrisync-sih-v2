const User = require('../models/User');

const verifySuperAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found in DB' });
    }

    if (user.role !== 'system_admin') {
      return res.status(403).json({ error: 'Forbidden: Super Admin access required' });
    }

    req.dbUser = user;
    next();
  } catch (error) {
    console.error('Super Admin verify error:', error);
    res.status(500).json({ error: 'Internal server error during authorization' });
  }
};

module.exports = verifySuperAdmin;
