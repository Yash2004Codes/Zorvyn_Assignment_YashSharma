import db from '../db/database';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { User, UserPublic } from '../models/types';

function toPublic(user: User): UserPublic {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active === 1,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export async function register(input: RegisterInput) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(input.email);
  if (existing) throw new Error('Email already registered');

  const password_hash = await hashPassword(input.password);

  const stmt = db.prepare(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (@name, @email, @password_hash, @role)
  `);

  const result = stmt.run({
    name: input.name,
    email: input.email,
    password_hash,
    role: input.role,
  });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return { user: toPublic(user), token };
}

export async function login(input: LoginInput) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(input.email) as User | undefined;

  if (!user) throw new Error('Invalid email or password');
  if (!user.is_active) throw new Error('Account is deactivated. Contact administrator.');

  const valid = await comparePassword(input.password, user.password_hash);
  if (!valid) throw new Error('Invalid email or password');

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  return { user: toPublic(user), token };
}
