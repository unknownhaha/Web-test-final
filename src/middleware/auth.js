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
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = authHeader.split(' ')[1];
  
  try{
    const decodedToken=jwt.verify(token,process.env.JWT_SECRET);
    req.user=decodedToken;
    next();
  }
  catch(error){
    return res.status(401).json({ error: 'Not implemented — complete authenticate middleware' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    // TODO:
    // 1. Check req.user exists
    // 2. Check req.user.role is in allowedRoles
    // 3. Return 403 if not allowed
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Not implemented — complete authorize middleware' });
    }
    
    next();
  };
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { authenticate, authorize, signToken };
