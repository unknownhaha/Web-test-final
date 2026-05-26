/**
 * TODO (B3): Complete JWT authentication & authorization
 */

const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  // TODO:
  // 1. Read Authorization: Bearer <token>
  // 2. Reject if missing → 401
  // 3. Verify with process.env.JWT_SECRET
  // 4. Reject alg:"none" and invalid tokens → 401
  // 5. Attach decoded payload to req.user

  return res.status(401).json({ error: 'Not implemented — complete authenticate middleware' });
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    // TODO:
    // 1. Check req.user exists
    // 2. Check req.user.role is in allowedRoles
    // 3. Return 403 if not allowed

    return res.status(403).json({ error: 'Not implemented — complete authorize middleware' });
  };
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { authenticate, authorize, signToken };
