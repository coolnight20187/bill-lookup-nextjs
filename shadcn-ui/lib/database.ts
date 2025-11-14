import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

export async function initializeDatabase() {
  try {
    // Create users/employees table
    await query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        full_name TEXT,
        phone TEXT,
        address TEXT,
        avatar_url TEXT,
        company_name TEXT,
        tax_code TEXT
      );
    `)

    // Create warehouse table
    await query(`
      CREATE TABLE IF NOT EXISTS kho (
        key TEXT PRIMARY KEY,
        account TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        name TEXT,
        address TEXT,
        amount_current TEXT,
        amount_previous TEXT,
        total TEXT,
        nhapAt TIMESTAMPTZ,
        xuatAt TIMESTAMPTZ,
        raw JSONB
      );
    `)

    // Create members table
    await query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        zalo TEXT,
        bank TEXT
      );
    `)

    // Create history table
    await query(`
      CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        account TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        name TEXT,
        address TEXT,
        amount_current TEXT,
        amount_previous TEXT,
        total TEXT,
        nhapAt TIMESTAMPTZ,
        xuatAt TIMESTAMPTZ,
        soldAt TIMESTAMPTZ,
        memberId INTEGER REFERENCES members(id) ON DELETE SET NULL,
        memberName TEXT,
        employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
        employee_username TEXT,
        raw JSONB
      );
    `)

    // Create work notes table
    await query(`
      CREATE TABLE IF NOT EXISTS work_notes (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        author_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
        author_username TEXT,
        note_text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}