import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ielts-camp-secure-session-fallback-key-2026';

export interface AdminJwtPayload {
  id: number;
  username: string;
  role: string;
  must_change_password?: boolean;
}

export function generateToken(payload: AdminJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AdminJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  adminUser?: AdminJwtPayload;
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.admin_token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Avtorizatsiyadan o‘tilmagan. Iltimos, administrator sifatida tizimga kiring.',
    });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Sessiya muddati tugagan yoki noto‘g‘ri token. Qayta kiring.',
    });
    return;
  }

  req.adminUser = payload;
  next();
}

// Simple in-memory rate limiter for spam prevention
interface RateLimitRecord {
  count: number;
  firstRequest: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function createRateLimiter(options: { windowMs: number; maxRequests: number; message: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = rateLimitMap.get(ip);
    if (!record) {
      rateLimitMap.set(ip, { count: 1, firstRequest: now });
      next();
      return;
    }

    if (now - record.firstRequest > options.windowMs) {
      // Window expired, reset
      rateLimitMap.set(ip, { count: 1, firstRequest: now });
      next();
      return;
    }

    if (record.count >= options.maxRequests) {
      res.status(429).json({
        success: false,
        error: options.message,
      });
      return;
    }

    record.count++;
    next();
  };
}
