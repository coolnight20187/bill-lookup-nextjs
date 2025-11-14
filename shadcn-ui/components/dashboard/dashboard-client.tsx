'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BillLookup } from './bill-lookup'
import { BillResults } from './bill-results'
import { WarehouseManager } from './warehouse-manager'
import { EmployeeManager } from './employee-manager'
import { CustomerManager } from './customer-manager'
import { TransactionHistory } from './transaction-history'
import { 
  LogOut, 
  User, 
  Package, 
  Users, 
  UserCheck, 
  History,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface User {
  id: number
  username: string
  role: 'admin' | 'user'
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
  raw: any
  nhapat?: string
  xuatat?: string
  memberName?: string
  employee_username?: string
}

interface DashboardClientProps {
  user: User
  onLogout: () => void
}

export function DashboardClient({ user, onLogout }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState('lookup')
  const [billResults, setBillResults] = useState<BillData[]>([])
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await onLogout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleBillResults = (results: BillData[]) => {
    setBillResults(results)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return Sun
      case 'light':
        return Moon
      default:
        return Monitor
    }
  }

  const ThemeIcon = getThemeIcon()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Tra cứu Bill (7tỷ.vn)</h1>
              <p className="text-sm text-muted-foreground">Hệ thống quản lý hóa đơn điện</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm">
                Chào, <span className="font-medium">{user.username}</span>
              </span>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role === 'admin' ? 'Admin' : 'User'}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
            >
              <ThemeIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? 'Đang thoát...' : 'Thoát'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="lookup" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Tra cứu
            </TabsTrigger>
            <TabsTrigger value="warehouse" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Kho hàng
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Nhân viên
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Khách hàng
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Lịch sử
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lookup" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <BillLookup onResults={handleBillResults} />
              </div>
              <div className="lg:col-span-2">
                <BillResults 
                  results={billResults} 
                  userRole={user.role}
                  userId={user.id}
                  username={user.username}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="warehouse">
            <WarehouseManager 
              userRole={user.role}
              userId={user.id}
              username={user.username}
            />
          </TabsContent>

          <TabsContent value="employees">
            <EmployeeManager userRole={user.role} />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerManager 
              userRole={user.role}
              userId={user.id}
              username={user.username}
            />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory userRole={user.role} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}