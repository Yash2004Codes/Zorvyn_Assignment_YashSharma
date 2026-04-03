// ── Roles ────────────────────────────────────────────────────
export enum Role {
  VIEWER = 'viewer',
  ANALYST = 'analyst',
  ADMIN = 'admin',
}

// ── User ─────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  is_active: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Financial Record ──────────────────────────────────────────
export type TransactionType = 'income' | 'expense';

export interface FinancialRecord {
  id: number;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;          // ISO date string YYYY-MM-DD
  notes: string | null;
  is_deleted: 0 | 1;    // soft delete
  created_by: number;   // user id
  created_at: string;
  updated_at: string;
}

// ── Auth ─────────────────────────────────────────────────────
export interface JwtPayload {
  userId: number;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ── API Response helpers ──────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}

// ── Filter / Pagination ───────────────────────────────────────
export interface RecordFilters {
  type?: TransactionType;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
