const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { users } = require('../db/data');

const router = express.Router();

router.get('/users', authenticate, authorize('admin'), (req, res) => {
  res.json(users.map(({ id, email, role, name }) => ({ id, email, role, name })));
});

module.exports = router;
