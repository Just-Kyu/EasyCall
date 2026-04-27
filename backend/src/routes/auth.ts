import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { env } from '../env.js';
import { prisma } from '../services/db.js';
import {
  clearSessionCookie,
  readSession,
  setSessionCookie,
  signSession,
} from '../middleware/auth.js';

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Bootstrap the env-var user the first time someone tries to log in with
 * those credentials. Lets the original single-user install upgrade to the
 * multi-user model without losing access.
 */
async function maybeBootstrapEnvUser(email: string, password: string) {
  if (!env.APP_USER_EMAIL || !env.APP_USER_PASSWORD_HASH) return null;
  if (email.toLowerCase() !== env.APP_USER_EMAIL.toLowerCase()) return null;
  const matches = await bcrypt.compare(password, env.APP_USER_PASSWORD_HASH);
  if (!matches) return null;
  const existing = await prisma.appUser.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return existing;
  const created = await prisma.appUser.create({
    data: {
      email: email.toLowerCase(),
      passwordHash: env.APP_USER_PASSWORD_HASH,
    },
  });
  // Adopt any orphan rows (created before multi-user existed) into this user.
  await prisma.account.updateMany({
    where: { appUserId: null },
    data: { appUserId: created.id },
  });
  await prisma.callLog.updateMany({
    where: { appUserId: null },
    data: { appUserId: created.id },
  });
  return created;
}

router.post('/signup', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
    return;
  }
  const email = parsed.data.email.toLowerCase();
  try {
    const existing = await prisma.appUser.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.appUser.create({
      data: { email, passwordHash },
    });
    setSessionCookie(res, signSession({ userId: user.id, email: user.email }));
    res.status(201).json({ ok: true, email: user.email });
  } catch (e) {
    console.error('POST /api/auth/signup failed:', e);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid email or password' });
    return;
  }
  const { email, password } = parsed.data;
  try {
    let user = await prisma.appUser.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      user = await maybeBootstrapEnvUser(email, password);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }
    } else if (!(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    setSessionCookie(res, signSession({ userId: user.id, email: user.email }));
    res.json({ ok: true, email: user.email });
  } catch (e) {
    console.error('POST /api/auth/login failed:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

router.get('/me', (req, res) => {
  const session = readSession(req);
  res.json(session ? { email: session.email } : null);
});

export default router;
