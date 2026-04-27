import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../env.js';

const COOKIE = 'session';

export interface SessionPayload {
  userId: string;
  email: string;
}

declare global {
  // Augment Express Request so route handlers can read req.session.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session?: SessionPayload;
    }
  }
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' });
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE, { path: '/' });
}

export function readSession(req: Request): SessionPayload | null {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as SessionPayload;
    // Older tokens (issued before multi-user migration) may not have userId.
    // Treat them as invalid so the user re-logs in.
    if (!decoded.userId) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function requireSession(req: Request, res: Response, next: NextFunction) {
  const session = readSession(req);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.session = session;
  next();
}
