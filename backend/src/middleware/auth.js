import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'urban_bites_jwt_secret_demo_2026';

/**
 * Middleware to verify JWT token and protect staff/admin routes
 */
export const protectAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid or expired token.',
      });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin account no longer exists.',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};
