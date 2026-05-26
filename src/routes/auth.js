/**
 * TODO (B5): Complete login route
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { findUserByEmail } = require('../db/data');
const { isValidEmail } = require('../middleware/validate');
const { signToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // TODO:
  // 1. Validate email format with isValidEmail → 400 if invalid
  // 2. Find user; if not found OR wrong password → 401 { error: 'Invalid credentials' }
  // 3. Use bcrypt.compare for password
  // 4. Return { token, user: { id, email, role, name } }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  if (!user || !bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.status(200).json({ token, user: { id, email, role, name } });
});

module.exports = router;
