"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/dashboard/header'
import { BillLookup } from '@/components/dashboard/bill-lookup'
import { WarehouseManagement } from '@/components/dashboard/warehouse-management'
import { EmployeeManagement } from '@/components/dashboard/employee-management'
import { CustomerManagement } from '@/components/dashboard/customer-management'
import { ResultsTable } from '@/components/dashboard/results-table'
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
  imported_at?: string
  exported_at?: string
  member_name?: string
  employee_username?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [billResults, setBillResults] = useState<BillData[]>([])
  const [selectedBills, setSelectedBills] = useState<BillData[]>([])
  const [viewMode, setViewMode] = useState<'lookup' | 'warehouse' | 'history'>('lookup')
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

  const handleBillResults = (results: BillData[]) => {
    setBillResults(results)
    setViewMode('lookup')
  }

  const handleSelectionChange = (selected: BillData[]) => {
    setSelectedBills(selected)
  }

  const loadWarehouse = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouse')
        .select('*')
        .is('exported_at', null)
        .order('imported_at', { ascending: false })

      if (error) throw error
      
      const warehouseData: BillData[] = (data || []).map(item => ({
        key: item.key,
        account: item.account,
        name: item.name || '-',
        address: item.address || '-',
        amount_current: item.amount_current,
        amount_previous: item.amount_previous,
        total: item.total,
        provider_id: item.provider_id,
        raw_data: item.raw_data,
        imported_at: item.imported_at,
        exported_at: item.exported_at,
      }))

      setBillResults(warehouseData)
      setViewMode('warehouse')
    } catch (error) {
      console.error('Error loading warehouse:', error)
    }
  }

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('transaction_history')
        .select('*')
        .order('sold_at', { ascending: false })

      if (error) throw error
      
      const historyData: BillData[] = (data || []).map(item => ({
        key: `${item.provider_id}::${item.account}::${item.sold_at}`,
        account: item.account,
        name: item.name || '-',
        address: item.address || '-',
        amount_current: item.amount_current,
        amount_previous: item.amount_previous,
        total: item.total,
        provider_id: item.provider_id,
        raw_data: item.raw_data,
        imported_at: item.imported_at,
        exported_at: item.exported_at,
        member_name: item.member_name,
        employee_username: item.employee_username,
      }))

      setBillResults(historyData)
      setViewMode('history')
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  const handleSellComplete = () => {
    // Refresh warehouse after selling
    if (viewMode === 'warehouse') {
      loadWarehouse()
    }
    setSelectedBills([])
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
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <BillLookup onResults={handleBillResults} />
            <WarehouseManagement 
              selectedBills={selectedBills} 
              user={user}
              onWarehouseOpen={loadWarehouse}
            />
            <EmployeeManagement user={user} />
            <CustomerManagement 
              user={user} 
              selectedBills={selectedBills}
              onSellComplete={handleSellComplete}
              onHistoryOpen={loadHistory}
            />
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            <ResultsTable 
              data={billResults}
              onSelectionChange={handleSelectionChange}
              viewMode={viewMode}
            />
          </div>
        </div>
      </main>
    </div>
  )
}