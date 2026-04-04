import pool from '../db/database';
import { FinancialRecord } from '../models/types';
import { CreateRecordInput, UpdateRecordInput, RecordFilterInput } from '../validators/record.validator';

export async function createRecord(input: CreateRecordInput, createdBy: number): Promise<FinancialRecord> {
  const result = await pool.query(`
    INSERT INTO financial_records (amount, type, category, date, notes, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [input.amount, input.type, input.category, input.date, input.notes ?? null, createdBy]);

  return result.rows[0] as FinancialRecord;
}

export async function getRecords(filters: RecordFilterInput & { userId: number, isGlobal?: boolean }) {
  let query = 'SELECT * FROM financial_records WHERE is_deleted = 0';
  const values: any[] = [];
  let counter = 1;

  if (!filters.isGlobal) {
    query += ` AND created_by = $${counter++}`;
    values.push(filters.userId);
  }

  if (filters.type) {
    query += ` AND type = $${counter++}`;
    values.push(filters.type);
  }
  if (filters.category) {
    query += ` AND category ILIKE $${counter++}`;
    values.push(`%${filters.category}%`);
  }
  if ((filters as any).date) {
    query += ` AND date = $${counter++}`;
    values.push((filters as any).date);
  }
  if (filters.dateFrom) {
    query += ` AND date >= $${counter++}`;
    values.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    query += ` AND date <= $${counter++}`;
    values.push(filters.dateTo);
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const offset = (page - 1) * limit;

  // Count query
  const countQuery = query.replace('SELECT *', 'SELECT count(*) as count');
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);

  // Final query with pagination
  const finalQuery = `
    ${query}
    ORDER BY date DESC, created_at DESC
    LIMIT $${counter++} OFFSET $${counter++}
  `;
  const finalValues = [...values, limit, offset];
  
  const recordsResult = await pool.query(finalQuery, finalValues);

  return {
    records: recordsResult.rows as FinancialRecord[],
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getRecordById(id: number): Promise<FinancialRecord> {
  const result = await pool.query('SELECT * FROM financial_records WHERE id = $1 AND is_deleted = 0', [id]);
  const record = result.rows[0] as FinancialRecord | undefined;
  if (!record) throw new Error('Record not found');
  return record;
}

export async function updateRecord(id: number, input: UpdateRecordInput): Promise<FinancialRecord> {
  const fields: string[] = [];
  const values: any[] = [];
  let counter = 1;

  if (input.amount !== undefined) {
    fields.push(`amount = $${counter++}`);
    values.push(input.amount);
  }
  if (input.type !== undefined) {
    fields.push(`type = $${counter++}`);
    values.push(input.type);
  }
  if (input.category !== undefined) {
    fields.push(`category = $${counter++}`);
    values.push(input.category);
  }
  if (input.date !== undefined) {
    fields.push(`date = $${counter++}`);
    values.push(input.date);
  }
  if (input.notes !== undefined) {
    fields.push(`notes = $${counter++}`);
    values.push(input.notes);
  }

  if (fields.length === 0) throw new Error('No fields to update');

  values.push(id);
  const result = await pool.query(
    `UPDATE financial_records SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${counter} AND is_deleted = 0 RETURNING *`,
    values
  );

  const updated = result.rows[0] as FinancialRecord | undefined;
  if (!updated) throw new Error('Record not found');
  return updated;
}

export async function deleteRecord(id: number): Promise<void> {
  const result = await pool.query(
    "UPDATE financial_records SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND is_deleted = 0 RETURNING id",
    [id]
  );
  if (result.rowCount === 0) throw new Error('Record not found');
}

