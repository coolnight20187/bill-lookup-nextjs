'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BillResults } from './bill-results'
import { 
  Package, 
  Loader2, 
  Filter,
  Trash2
} from 'lucide-react'

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

interface WarehouseManagerProps {
  userRole: 'admin' | 'user'
  userId: number
  username: string
}

export function WarehouseManager({ userRole, userId, username }: WarehouseManagerProps) {
  const [warehouseItems, setWarehouseItems] = useState<BillData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  const loadWarehouse = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/warehouse/list')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Lỗi tải kho')
      }

      const data = await response.json()
      setWarehouseItems(data)
    } catch (error: any) {
      alert(`Lỗi tải kho: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWarehouse()
  }, [])

  const handleFilter = () => {
    if (!filterFrom && !filterTo) {
      alert('Vui lòng nhập số tiền Từ hoặc Đến')
      return
    }

    const from = (parseFloat(filterFrom) || 0) * 100000
    const to = (parseFloat(filterTo) || Infinity) * 100000

    const filtered = warehouseItems.filter(item => {
      const total = parseInt(item.total) || 0
      return total >= from && total <= to
    })

    setWarehouseItems(filtered)
  }

  const handleRemoveSelected = async (selectedKeys: string[]) => {
    if (selectedKeys.length === 0) {
      alert('Vui lòng chọn hóa đơn cần xóa')
      return
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedKeys.length} hóa đơn khỏi kho?`)) {
      return
    }

    try {
      const response = await fetch('/api/warehouse/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: selectedKeys })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Lỗi xóa kho')
      }

      alert(`Đã xóa ${result.removed} hóa đơn khỏi kho`)
      loadWarehouse() // Reload warehouse
    } catch (error: any) {
      alert(`Lỗi xóa kho: ${error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Quản lý Kho
            </CardTitle>
            <CardDescription>
              Tổng: {warehouseItems.length} hóa đơn trong kho
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={loadWarehouse}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Tải lại Kho
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Lọc theo số tiền
            </CardTitle>
            <CardDescription>
              Lọc hóa đơn theo khoảng tiền (đơn vị: triệu đồng)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="filterFrom">Từ (triệu)</Label>
                <Input
                  id="filterFrom"
                  type="number"
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="filterTo">Đến (triệu)</Label>
                <Input
                  id="filterTo"
                  type="number"
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                  placeholder="∞"
                />
              </div>
            </div>
            <Button onClick={handleFilter} className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Lọc
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <BillResults 
        results={warehouseItems}
        userRole={userRole}
        userId={userId}
        username={username}
      />
    </div>
  )
}