const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getIsMockMode } = require('../config/db');
const { getMockData } = require('../config/mockStore');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      if (getIsMockMode()) {
        const mockData = getMockData();
        const user = mockData.users.find(u => u._id === decoded.id);
        if (!user) {
          return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }
        // Exclude password from request object
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      } else {
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }
        req.user = user;
      }

      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
