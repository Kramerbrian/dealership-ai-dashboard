export type Role = 'viewer' | 'owner' | 'admin' | 'manager' | 'analyst' | 'superadmin';

export function isValidRole(role: string): role is Role {
  return (
    role === 'viewer' ||
    role === 'owner' ||
    role === 'admin' ||
    role === 'manager' ||
    role === 'analyst' ||
    role === 'superadmin'
  );
}
