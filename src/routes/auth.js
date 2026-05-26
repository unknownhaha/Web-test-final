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

  return res.status(501).json({ error: 'Not implemented — complete login route' });
});

module.exports = router;
