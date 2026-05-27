/**
 * TODO (B3): Complete JWT authentication & authorization
 */

const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  // 1. Read Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  
  // 2. Reject if missing → 401
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = authHeader.split(' ')[1];
  
  try {
    // 4. Reject alg:"none" (ป้องกัน attack รูปแบบ alg:none)
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || decodedHeader.header.alg === 'none') {
      return res.status(401).json({ error: 'Malformed token or alg: none is not allowed' });
    }

    // 3. Verify with process.env.JWT_SECRET
    // 4. Reject invalid tokens → 401 (ดักจับด้วย catch)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Attach decoded payload to req.user
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    // 1. Check req.user exists
    // 2. Check req.user.role is in allowedRoles
    // 3. Return 403 if not allowed
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission' });
    }
    
    next();
  };
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { authenticate, authorize, signToken };
