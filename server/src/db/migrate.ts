import pool from './database';

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Users table ────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        name          TEXT    NOT NULL,
        email         TEXT    NOT NULL UNIQUE,
        password_hash TEXT    NOT NULL,
        role          TEXT    NOT NULL DEFAULT 'viewer'
                            CHECK(role IN ('viewer', 'analyst', 'admin')),
        is_active     INTEGER NOT NULL DEFAULT 1
                            CHECK(is_active IN (0, 1)),
        created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Financial records table ─────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS financial_records (
        id          SERIAL PRIMARY KEY,
        amount      NUMERIC NOT NULL CHECK(amount > 0),
        type        TEXT    NOT NULL CHECK(type IN ('income', 'expense')),
        category    TEXT    NOT NULL,
        date        TEXT    NOT NULL,
        notes       TEXT,
        is_deleted  INTEGER NOT NULL DEFAULT 0 CHECK(is_deleted IN (0, 1)),
        created_by  INTEGER NOT NULL REFERENCES users(id),
        created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ── Indexes ────────────────────────────────────────────────
    await client.query(`CREATE INDEX IF NOT EXISTS idx_records_type     ON financial_records(type);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_records_category ON financial_records(category);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_records_date     ON financial_records(date);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_records_deleted  ON financial_records(is_deleted);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email);`);

    // Seed test users
    const checkResult = await client.query('SELECT count(*) as count FROM users WHERE email IN ($1, $2, $3)', [
      'test1@finance.com', 'test2@finance.com', 'test3@finance.com'
    ]);
    
    if (parseInt(checkResult.rows[0].count) < 3) {
      const hash = '$2b$10$CnLDQFYyIU6f9TRJvQfXr.oj4PXAoCrZjOvx/fNpyOhO7wPuOQRSi'; // Correct Admin@1234
      
      await client.query(`INSERT INTO users (name, email, password_hash, role) VALUES ('Test Admin', 'test1@finance.com', $1, 'admin') ON CONFLICT (email) DO NOTHING`, [hash]);
      await client.query(`INSERT INTO users (name, email, password_hash, role) VALUES ('Test Analyst', 'test2@finance.com', $1, 'analyst') ON CONFLICT (email) DO NOTHING`, [hash]);
      await client.query(`INSERT INTO users (name, email, password_hash, role) VALUES ('Test Viewer', 'test3@finance.com', $1, 'viewer') ON CONFLICT (email) DO NOTHING`, [hash]);
      console.log('✅ Seeded clean test accounts: test1@ (Admin), test2@ (Analyst), test3@ (Viewer). Password: Admin@1234');
    }

    // Seed financial records for test1 if empty
    const recordsCheck = await client.query('SELECT count(*) as count FROM financial_records');
    if (parseInt(recordsCheck.rows[0].count) === 0) {
      const adminResult = await client.query('SELECT id FROM users WHERE email = $1', ['test1@finance.com']);
      const adminId = adminResult.rows[0]?.id;

      if (adminId) {
        const months = [0, 1, 2, 3];
        for (const m of months) {
          const monthDate = new Date();
          monthDate.setMonth(monthDate.getMonth() - m);
          const yearMonth = monthDate.toISOString().slice(0, 7);

          // Income
          await client.query('INSERT INTO financial_records (amount, type, category, date, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6)', 
            [5000 + (Math.random()*200), 'income', 'Salary', `${yearMonth}-01`, 'Monthly Payroll', adminId]);
          
          if (Math.random() > 0.5) {
            await client.query('INSERT INTO financial_records (amount, type, category, date, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6)', 
              [850, 'income', 'Freelancing', `${yearMonth}-15`, 'Side Project', adminId]);
          }

          // Expenses
          await client.query('INSERT INTO financial_records (amount, type, category, date, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6)', 
            [1200, 'expense', 'Rent', `${yearMonth}-05`, 'Monthly Rent', adminId]);
          
          await client.query('INSERT INTO financial_records (amount, type, category, date, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6)', 
            [120, 'expense', 'Utility Bills', `${yearMonth}-10`, 'Electricity & Water', adminId]);

          // Sample variable expenses
          for (let i = 0; i < 3; i++) {
             const day = String(Math.floor(Math.random() * 25) + 1).padStart(2, '0');
             await client.query('INSERT INTO financial_records (amount, type, category, date, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6)', 
               [80 + (Math.random()*40), 'expense', 'Groceries', `${yearMonth}-${day}`, 'Weekly Shop', adminId]);
          }
        }
        console.log('✅ Seeded diverse financial records for test1@ (Admin)');
      }
    }

    await client.query('COMMIT');
    console.log('✅ Database migrations complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

