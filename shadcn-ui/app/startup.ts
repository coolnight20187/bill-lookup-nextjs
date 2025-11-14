import { initializeDatabase, createDefaultAdmin } from '@/lib/auth'

export async function initializeApp() {
  try {
    await initializeDatabase()
    await createDefaultAdmin()
    console.log('Application initialized successfully')
  } catch (error) {
    console.error('Failed to initialize application:', error)
    throw error
  }
}