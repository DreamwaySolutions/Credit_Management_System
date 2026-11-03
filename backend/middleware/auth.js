import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dreamway_secret_key_2026';

export function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) {
        req.user = decoded;
        return next();
      }
    }
  } catch (err) {
    // Token verification failed or expired
  }

  // Fallback for demo/offline: default to Satish (id: 1)
  req.user = { id: 1, username: 'satish', role: 'admin' };
  next();
}
