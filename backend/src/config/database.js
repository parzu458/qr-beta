const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Inizializzazione Schema (sintassi identica a SQLite)
async function initSchema() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS qr_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      short_id TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      destination_url TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      fg_color TEXT DEFAULT '#0f172a',
      bg_color TEXT DEFAULT '#ffffff',
      logo_url TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      qr_code_id INTEGER NOT NULL,
      scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      anonymized_ip TEXT,
      country TEXT DEFAULT 'Unknown',
      city TEXT DEFAULT 'Unknown',
      device_type TEXT DEFAULT 'desktop',
      os_name TEXT DEFAULT 'Unknown',
      browser_name TEXT DEFAULT 'Unknown',
      referrer TEXT DEFAULT 'Direct',
      FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS access_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      email TEXT,
      event_type TEXT NOT NULL,
      success BOOLEAN NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  console.log('✅ Schema Turso creato/verificato con successo.');
}

const schemaReady = initSchema().catch((err) => {
  console.error(' Errore inizializzazione schema Turso:', err);
});

// Wrapper compatibile con la sintassi usata nei controller (SQLite-style)
const dbQuery = {
  get: async (sql, params = []) => {
    await schemaReady;
    const res = await client.execute({ sql, args: params });
    return res.rows[0] || null;
  },
  all: async (sql, params = []) => {
    await schemaReady;
    const res = await client.execute({ sql, args: params });
    return res.rows;
  },
  run: async (sql, params = []) => {
    await schemaReady;
    const res = await client.execute({ sql, args: params });
    return {
      lastID: res.lastInsertRowid ? Number(res.lastInsertRowid) : null,
      changes: res.rowsAffected,
    };
  },
};

module.exports = { client, dbQuery };
