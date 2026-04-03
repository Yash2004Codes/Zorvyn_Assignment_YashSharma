import db from '../db/database';
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

export function getAllUsers(): UserPublic[] {
  const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as User[];
  return users.map(toPublic);
}

export function getUserById(id: number): UserPublic {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  if (!user) throw new Error('User not found');
  return toPublic(user);
}

export function updateUser(id: number, input: UpdateUserInput): UserPublic {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  if (!user) throw new Error('User not found');

  const fields: string[] = [];
  const values: Record<string, unknown> = { id };

  if (input.name !== undefined)      { fields.push('name = @name');           values.name = input.name; }
  if (input.role !== undefined)      { fields.push('role = @role');           values.role = input.role; }
  if (input.is_active !== undefined) { fields.push('is_active = @is_active'); values.is_active = input.is_active ? 1 : 0; }

  if (fields.length === 0) throw new Error('No fields to update');

  fields.push("updated_at = datetime('now')");
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = @id`).run(values);

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User;
  return toPublic(updated);
}

export function deleteUser(id: number): void {
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) throw new Error('User not found');
  db.prepare('UPDATE users SET is_active = 0, updated_at = datetime(\'now\') WHERE id = ?').run(id);
}
