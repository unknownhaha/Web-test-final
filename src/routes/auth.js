const express = require('express');
const bcrypt = require('bcryptjs');
const { findUserByEmail } = require('../db/data');
const { isValidEmail } = require('../middleware/validate');
const { signToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const user = findUserByEmail(email.trim());
  const valid = user && await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  return res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name }
  });
});

module.exports = router;
