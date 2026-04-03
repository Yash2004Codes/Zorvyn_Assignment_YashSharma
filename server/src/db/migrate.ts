import db from './database';

export function runMigrations(): void {
  db.exec(`
    -- ── Users table ────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      password_hash TEXT  NOT NULL,
      role        TEXT    NOT NULL DEFAULT 'viewer'
                          CHECK(role IN ('viewer', 'analyst', 'admin')),
      is_active   INTEGER NOT NULL DEFAULT 1
                          CHECK(is_active IN (0, 1)),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Financial records table ─────────────────────────────────
    CREATE TABLE IF NOT EXISTS financial_records (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      amount      REAL    NOT NULL CHECK(amount > 0),
      type        TEXT    NOT NULL CHECK(type IN ('income', 'expense')),
      category    TEXT    NOT NULL,
      date        TEXT    NOT NULL,
      notes       TEXT,
      is_deleted  INTEGER NOT NULL DEFAULT 0 CHECK(is_deleted IN (0, 1)),
      created_by  INTEGER NOT NULL REFERENCES users(id),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Indexes ────────────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_records_type     ON financial_records(type);
    CREATE INDEX IF NOT EXISTS idx_records_category ON financial_records(category);
    CREATE INDEX IF NOT EXISTS idx_records_date     ON financial_records(date);
    CREATE INDEX IF NOT EXISTS idx_records_deleted  ON financial_records(is_deleted);
    CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email);
  `);

  // Seed test1, test2, and test3 users
  const check = db.prepare('SELECT count(*) as count FROM users WHERE email IN (?, ?, ?)').get(
    'test1@finance.com', 'test2@finance.com', 'test3@finance.com'
  ) as { count: number };

  if (check.count < 3) {
    const hash = '$2b$10$CnLDQFYyIU6f9TRJvQfXr.oj4PXAoCrZjOvx/fNpyOhO7wPuOQRSi'; // Correct Admin@1234
    
    db.prepare(`INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES ('Test Admin', 'test1@finance.com', ?, 'admin')`).run(hash);
    db.prepare(`INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES ('Test Analyst', 'test2@finance.com', ?, 'analyst')`).run(hash);
    db.prepare(`INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES ('Test Viewer', 'test3@finance.com', ?, 'viewer')`).run(hash);
    console.log('✅ Seeded clean test accounts: test1@ (Admin), test2@ (Analyst), test3@ (Viewer). Password: Admin@1234');
  }

  // Seed financial records for test1 if empty
  const recordsCheck = db.prepare('SELECT count(*) as count FROM financial_records').get() as { count: number };
  if (recordsCheck.count === 0) {
    const admin = db.prepare('SELECT id FROM users WHERE email = ?').get('test1@finance.com') as { id: number };
    if (admin) {
      const categories = ['Salary', 'Freelancing', 'Dividends', 'Rent', 'Groceries', 'Starbucks', 'Internet', 'Gym', 'Cinema', 'Utility Bills', 'Amazon Store'];
      const months = [0, 1, 2, 3]; // current, last month, -2, -3
      
      const insert = db.prepare(`
        INSERT INTO financial_records (amount, type, category, date, notes, created_by)
        VALUES (@amount, @type, @category, @date, @notes, @created_by)
      `);

      months.forEach(m => {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - m);
        const yearMonth = monthDate.toISOString().slice(0, 7); // YYYY-MM
        
        // Income
        insert.run({ amount: 5000 + (Math.random()*200), type: 'income', category: 'Salary', date: `${yearMonth}-01`, notes: 'Monthly Payroll', created_by: admin.id });
        if (Math.random() > 0.5) insert.run({ amount: 850, type: 'income', category: 'Freelancing', date: `${yearMonth}-15`, notes: 'Side Project', created_by: admin.id });
        if (m === 2) insert.run({ amount: 150, type: 'income', category: 'Dividends', date: `${yearMonth}-20`, notes: 'Stock Dividends', created_by: admin.id });

        // Fixed Expenses
        insert.run({ amount: 1200, type: 'expense', category: 'Rent', date: `${yearMonth}-05`, notes: 'Monthly Rent', created_by: admin.id });
        insert.run({ amount: 120, type: 'expense', category: 'Utility Bills', date: `${yearMonth}-10`, notes: 'Electricity & Water', created_by: admin.id });
        insert.run({ amount: 60, type: 'expense', category: 'Internet', date: `${yearMonth}-03`, notes: 'Fiber Optic', created_by: admin.id });
        insert.run({ amount: 45, type: 'expense', category: 'Gym', date: `${yearMonth}-01`, notes: 'Membership', created_by: admin.id });

        // Variable Expenses (multiple per month)
        for (let i = 0; i < 5; i++) {
           const day = String(Math.floor(Math.random() * 25) + 1).padStart(2, '0');
           insert.run({ amount: 80 + (Math.random()*40), type: 'expense', category: 'Groceries', date: `${yearMonth}-${day}`, notes: 'Weekly Shop', created_by: admin.id });
        }
        for (let i = 0; i < 3; i++) {
           const day = String(Math.floor(Math.random() * 25) + 1).padStart(2, '0');
           insert.run({ amount: 5 + (Math.random()*15), type: 'expense', category: 'Starbucks', date: `${yearMonth}-${day}`, notes: 'Coffee stop', created_by: admin.id });
        }
      });
      console.log('✅ Seeded 50+ diverse financial records for test1@ (Admin)');
    }
  }

  console.log('✅ Database migrations complete');
}
