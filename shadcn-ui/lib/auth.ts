import bcrypt from 'bcrypt'
import { query } from './database'

export interface User {
  id: number
  username: string
  role: 'admin' | 'user'
  full_name?: string
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const result = await query(
      'SELECT id, username, password_hash, role, full_name FROM employees WHERE username = $1',
      [username]
    )
    
    if (result.rowCount === 0) {
      return null
    }

    const user = result.rows[0]
    const isValid = await bcrypt.compare(password, user.password_hash)
    
    if (!isValid) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export async function createDefaultAdmin() {
  try {
    const adminCheck = await query('SELECT 1 FROM employees WHERE username = $1', ['admin'])
    
    if (adminCheck.rowCount === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10)
      await query(
        'INSERT INTO employees (username, password_hash, role, full_name) VALUES ($1, $2, $3, $4)',
        ['admin', hashedPassword, 'admin', 'Quản Trị Viên']
      )
      console.log('Default admin created: admin / 123456')
    }
  } catch (error) {
    console.error('Error creating default admin:', error)
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