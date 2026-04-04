import pool from '../db/database';
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
  const existingResult = await pool.query('SELECT id FROM users WHERE email = $1', [input.email]);
  if (existingResult.rowCount && existingResult.rowCount > 0) throw new Error('Email already registered');

  const password_hash = await hashPassword(input.password);

  const result = await pool.query(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [input.name, input.email, password_hash, input.role]);

  const user = result.rows[0] as User;
  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return { user: toPublic(user), token };
}

export async function login(input: LoginInput) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [input.email]);
  const user = result.rows[0] as User | undefined;

  if (!user) throw new Error('Invalid email or password');
  if (user.is_active === 0) throw new Error('Account is deactivated. Contact administrator.');

  const valid = await comparePassword(input.password, user.password_hash);
  if (!valid) throw new Error('Invalid email or password');

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  return { user: toPublic(user), token };
}

