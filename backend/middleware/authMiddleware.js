import { verifyJwt } from '../utils/auth.js';
import { User } from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJwt(token);

  if (!payload || !payload.id) {
    res.status(401).json({ message: 'Invalid or expired session token.' });
    return;
  }

  try {
    const user = await User.findById(payload.id);
    if (!user) {
      res.status(401).json({ message: 'User account no longer exists.' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
