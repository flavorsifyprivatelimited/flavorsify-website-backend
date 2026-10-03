import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAdmin(req, res, next) {
  const token = req.cookies?.flavorsify_admin;

  if (!token) {
    return res.status(401).json({
      message: 'Admin authentication required.',
    });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    const allowedAdminEmails = [
      env.ADMIN_EMAIL,
      env.ADMIN_EMAIL_2,
    ]
      .filter(Boolean)
      .map((email) => email.toLowerCase());

    if (
      payload.role !== 'admin' ||
      typeof payload.email !== 'string' ||
      !allowedAdminEmails.includes(payload.email.toLowerCase())
    ) {
      return res.status(401).json({
        message: 'Invalid admin session.',
      });
    }

    req.admin = { email: payload.email };
    next();
  } catch {
    return res.status(401).json({
      message: 'Your admin session has expired. Please log in again.',
    });
  }
}