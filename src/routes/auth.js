// ============================================================
// B5 — Secure Login Route
// Topic: Lecture 08 — AuthN, bcrypt password, JWT issue
// Security: never leak whether email exists (same error message)
// ============================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const { findUserByEmail } = require('../db/data');
const { isValidEmail } = require('../middleware/validate');
const { signToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Step 1: validate email format on server-side
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Step 2: find user in mock database by email
  const user = findUserByEmail(email.trim());

  // Step 3: compare plain password with stored bcrypt hash
  // bcrypt.compare is async — safe against timing attacks
  const valid = user && await bcrypt.compare(password, user.passwordHash);

  // Step 4: reject with same message whether email wrong OR password wrong
  // This prevents attackers from knowing if an email is registered
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Step 5: create JWT token with user info (AuthN complete)
  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  // Step 6: return token + safe user info (no password hash!)
  return res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name }
  });
});

module.exports = router;
