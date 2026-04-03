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

  // Seed a default admin user if none exists
  const admin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@finance.com');
  if (!admin) {
    // bcrypt hash of "Admin@1234"
    const hash = '$2a$10$wN1Q/X8D1n7lTf2q0aJq4.V6L3A1V8S2G6QZtA8T8P4T3zEw/qA5S';
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Super Admin', 'admin@finance.com', ?, 'admin')
    `).run(hash);
    console.log('✅ Seeded default admin: admin@finance.com / Admin@1234');
  }

  console.log('✅ Database migrations complete');
}
