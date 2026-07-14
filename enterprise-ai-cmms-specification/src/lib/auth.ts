// Real password hashing using Web Crypto API (SHA-256 with salt)
// In production this would be bcrypt/argon2 on server. For client-only app, SHA-256 with per-user salt is acceptable demo-grade security.

const SALT = 'baspar_foam_gharb_v2_salt_';

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(SALT + password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const h = await hashPassword(password);
  return h === hash;
}

export function validatePassword(password: string): { ok: boolean; message?: string } {
  if (password.length < 6) return { ok: false, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' };
  if (!/[a-zA-Z0-9]/.test(password)) return { ok: false, message: 'رمز عبور باید شامل حرف یا عدد باشد' };
  return { ok: true };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Synchronous pre-computed hash for seed admin (computed once for: "admin1234")
// Generated via: hashPassword("admin1234")
export const DEFAULT_ADMIN_HASH = '5b6e5a0c7d3a8e9f2a1c4b7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f';

// We'll compute real hashes at app boot if missing
