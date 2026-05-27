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

  // 1. Validate email format with isValidEmail → 400 if invalid
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Find user
  const user = findUserByEmail(email);

  // 2. Find user; if not found OR wrong password → 401 { error: 'Invalid credentials' }
  // 3. Use bcrypt.compare for password
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    // ห้าม leak ว่า email มีอยู่จริงหรือไม่ (ใช้ "Invalid credentials" ทั้งสองกรณี)
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 4. Return { token, user: { id, email, role, name } }
  // return JWT ที่มี { sub, email, role } (จัดการใน signToken แล้วแค่ส่ง payload ไป)
  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  return res.status(200).json({ 
    token, 
    user: { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name 
    } 
  });
});

module.exports = router;
