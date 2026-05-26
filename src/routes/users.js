const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { users, findUserById } = require('../db/data');

const router = express.Router();

router.get('/me', authenticate, (req, res) => {
  const user = findUserById(req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, role: user.role, name: user.name });
});

module.exports = router;
