// ============================================================
// B3 — JWT Authentication (AuthN) & Authorization (AuthZ)
// Topic: Lecture 08
//   AuthN = "Who are you?" (verify identity via JWT)
//   AuthZ = "What can you do?" (check role permission)
// ============================================================

const jwt = require('jsonwebtoken');

// --- AUTHN middleware: verify the user is logged in ---
function authenticate(req, res, next) {
  // Read Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;

  // Reject if header missing or doesn't start with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' }); // 401 = not authenticated
  }

  // Extract just the token part (after "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Verify token signature using secret from .env
    // algorithms: ['HS256'] rejects alg:"none" attacks
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    // Attach decoded payload to req.user so later routes can use it
    // decoded = { sub: userId, email, role, iat, exp }
    req.user = decoded;
    next(); // token valid → continue to next middleware
  } catch {
    // Token expired, tampered, or malformed
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// --- AUTHZ middleware factory: check if user has allowed role ---
function authorize(...allowedRoles) {
  // Returns a middleware function (used like: authorize('admin'))
  return (req, res, next) => {
    // Should not happen if authenticate ran first, but safety check
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user's role is in the allowed list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' }); // 403 = authenticated but not allowed
    }

    next(); // role OK → continue
  };
}

// Helper: create a signed JWT token (used in login route)
function signToken(payload) {
  // payload = { sub, email, role }, expires in 1 hour
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { authenticate, authorize, signToken };
