import pool from '../db/database';
import { User, UserPublic } from '../models/types';
import { UpdateUserInput } from '../validators/user.validator';

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

export async function getAllUsers(): Promise<UserPublic[]> {
  const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  return result.rows.map(toPublic);
}

export async function getUserById(id: number): Promise<UserPublic> {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  const user = result.rows[0] as User | undefined;
  if (!user) throw new Error('User not found');
  return toPublic(user);
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<UserPublic> {
  const fields: string[] = [];
  const values: any[] = [];
  let counter = 1;

  if (input.name !== undefined) {
    fields.push(`name = $${counter++}`);
    values.push(input.name);
  }
  if (input.role !== undefined) {
    fields.push(`role = $${counter++}`);
    values.push(input.role);
  }
  if (input.is_active !== undefined) {
    fields.push(`is_active = $${counter++}`);
    values.push(input.is_active ? 1 : 0);
  }

  if (fields.length === 0) throw new Error('No fields to update');

  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${counter} RETURNING *`,
    values
  );

  const updated = result.rows[0] as User | undefined;
  if (!updated) throw new Error('User not found');
  return toPublic(updated);
}

export async function deleteUser(id: number): Promise<void> {
  const result = await pool.query(
    'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
    [id]
  );
  if (result.rowCount === 0) throw new Error('User not found');
}

