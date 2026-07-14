#!/usr/bin/env node
// =====================================================
// 🔐 Baspar CMMS - Password Hash Generator
// =====================================================
// این اسکریپت hash های bcrypt واقعی برای seed data تولید می‌کند
//
// Usage:
//   cd deploy/backend
//   npm install bcryptjs
//   node ../scripts/generate-passwords.js
//
// Output: SQL update statements قابل اجرا در psql
// =====================================================

const bcrypt = require('bcryptjs');

const DEFAULT_PASSWORD = 'Baspar@1234';
const users = [
  { email: 'admin@basparfoam.ir',   name: 'مهندس علی رضایی' },
  { email: 'manager@basparfoam.ir', name: 'مهندس حسین کریمی' },
  { email: 'sup1@basparfoam.ir',    name: 'مهندس مجید احمدی' },
  { email: 'tech1@basparfoam.ir',   name: 'سعید موسوی' },
  { email: 'tech2@basparfoam.ir',   name: 'رضا فتاحی' },
  { email: 'tech3@basparfoam.ir',   name: 'محمد جعفری' },
  { email: 'op1@basparfoam.ir',     name: 'حمید رستمی' },
];

async function main() {
  console.log('-- Generated at:', new Date().toISOString());
  console.log('-- Password for all users:', DEFAULT_PASSWORD);
  console.log('-- Copy the SQL below and run in psql:\n');
  console.log('BEGIN;');

  for (const u of users) {
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = '${u.email}';`);
  }

  console.log('COMMIT;\n');
  console.log('-- ✅ Done! All users now have password:', DEFAULT_PASSWORD);
  console.log('-- ⚠️  Change these passwords in production!');
}

main().catch(err => { console.error(err); process.exit(1); });
