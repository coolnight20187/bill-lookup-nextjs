import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          username: string
          role: 'admin' | 'user'
          full_name: string | null
          phone: string | null
          address: string | null
          avatar_url: string | null
          company_name: string | null
          tax_code: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          username: string
          role?: 'admin' | 'user'
          full_name?: string | null
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          company_name?: string | null
          tax_code?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          username?: string
          role?: 'admin' | 'user'
          full_name?: string | null
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          company_name?: string | null
          tax_code?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      members: {
        Row: {
          id: string
          name: string
          zalo: string | null
          bank: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          zalo?: string | null
          bank?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          zalo?: string | null
          bank?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      warehouse: {
        Row: {
          id: string
          key: string
          account: string
          provider_id: string
          name: string | null
          address: string | null
          amount_current: string
          amount_previous: string
          total: string
          imported_at: string
          exported_at: string | null
          raw_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          account: string
          provider_id: string
          name?: string | null
          address?: string | null
          amount_current: string
          amount_previous: string
          total: string
          imported_at: string
          exported_at?: string | null
          raw_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          account?: string
          provider_id?: string
          name?: string | null
          address?: string | null
          amount_current?: string
          amount_previous?: string
          total?: string
          imported_at?: string
          exported_at?: string | null
          raw_data?: any
          created_at?: string
          updated_at?: string
        }
      }
      transaction_history: {
        Row: {
          id: string
          account: string
          provider_id: string
          name: string | null
          address: string | null
          amount_current: string
          amount_previous: string
          total: string
          imported_at: string
          exported_at: string | null
          sold_at: string
          member_id: string | null
          member_name: string | null
          employee_id: string | null
          employee_username: string | null
          raw_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account: string
          provider_id: string
          name?: string | null
          address?: string | null
          amount_current: string
          amount_previous: string
          total: string
          imported_at: string
          exported_at?: string | null
          sold_at: string
          member_id?: string | null
          member_name?: string | null
          employee_id?: string | null
          employee_username?: string | null
          raw_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account?: string
          provider_id?: string
          name?: string | null
          address?: string | null
          amount_current?: string
          amount_previous?: string
          total?: string
          imported_at?: string
          exported_at?: string | null
          sold_at?: string
          member_id?: string | null
          member_name?: string | null
          employee_id?: string | null
          employee_username?: string | null
          raw_data?: any
          created_at?: string
          updated_at?: string
        }
      }
      work_notes: {
        Row: {
          id: string
          employee_id: string
          author_id: string | null
          author_username: string | null
          note_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          author_id?: string | null
          author_username?: string | null
          note_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          author_id?: string | null
          author_username?: string | null
          note_text?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'user'
    }
  }
}