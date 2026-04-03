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

  console.log('✅ Database migrations complete');
}
