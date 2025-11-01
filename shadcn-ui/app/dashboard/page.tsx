"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/header'
import { BillLookup } from '@/components/dashboard/bill-lookup'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

interface User {
  id: string
  username: string
  role: string
  full_name?: string
}

interface BillData {
  key: string
  account: string
  name: string
  address: string
  amount_current: string
  amount_previous: string
  total: string
  provider_id: string
  raw_data: any
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [billResults, setBillResults] = useState<BillData[]>([])
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Get employee data from user metadata or database
      const employeeId = session.user.user_metadata?.employee_id
      if (employeeId) {
        const { data: employee } = await supabase
          .from('employees')
          .select('*')
          .eq('id', employeeId)
          .eq('is_active', true)
          .single()

        if (employee) {
          setUser({
            id: employee.id,
            username: employee.username,
            role: employee.role,
            full_name: employee.full_name,
          })
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container mx-auto py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <BillLookup onResults={setBillResults} />
          </div>
          <div className="lg:col-span-3">
            {/* Results table will be implemented here */}
            <div className="text-center text-muted-foreground">
              Kết quả tra cứu sẽ hiển thị ở đây
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}