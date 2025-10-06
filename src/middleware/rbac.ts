import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type UserRole = 'admin' | 'manager' | 'analyst' | 'dealer' | 'viewer';

export interface AuthenticatedUser {
  userId: string;
  roles: UserRole[];
  tenantId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const AUTH_SCHEME = 'Bearer ';

export function requireRoles(required: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.header('Authorization') || req.header('authorization');
    if (!header || !header.startsWith(AUTH_SCHEME)) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = header.substring(AUTH_SCHEME.length);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server misconfigured: missing JWT_SECRET' });
    }

    try {
      const decoded = jwt.verify(token, secret) as AuthenticatedUser | (AuthenticatedUser & { iat?: number; exp?: number });
      req.user = { userId: (decoded as any).userId, roles: (decoded as any).roles || [], tenantId: (decoded as any).tenantId };
      if (!req.user.roles || !Array.isArray(req.user.roles)) {
        return res.status(403).json({ error: 'Forbidden: no roles present' });
      }
      const hasAny = required.length === 0 || required.some(r => req.user!.roles.includes(r));
      if (!hasAny) {
        return res.status(403).json({ error: 'Forbidden: insufficient role' });
      }
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
