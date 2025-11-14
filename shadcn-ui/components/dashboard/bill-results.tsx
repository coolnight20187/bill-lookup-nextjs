'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Download, 
  Copy, 
  Archive, 
  Trash2,
  CheckSquare,
  Square,
  ArrowUpDown,
  FileSpreadsheet,
  Package
} from 'lucide-react'
import { formatMoney, formatDate } from '@/lib/utils'

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

interface BillResultsProps {
  results: BillData[]
  userRole: 'admin' | 'user'
  userId: number
  username: string
}

export function BillResults({ results, userRole, userId, username }: BillResultsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [hideZero, setHideZero] = useState(false)
  const [selectedBills, setSelectedBills] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = results.filter(bill => {
      // Hide zero amounts if enabled
      if (hideZero && parseInt(bill.total) === 0) return false
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          bill.name.toLowerCase().includes(searchLower) ||
          bill.address.toLowerCase().includes(searchLower) ||
          bill.account.toLowerCase().includes(searchLower) ||
          (bill.employee_username || '').toLowerCase().includes(searchLower)
        )
      }
      
      return true
    })

    // Sort results
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof BillData]
        let bVal: any = b[sortConfig.key as keyof BillData]

        if (sortConfig.key === 'total' || sortConfig.key === 'amount_current' || sortConfig.key === 'amount_previous') {
          aVal = parseInt(aVal) || 0
          bVal = parseInt(bVal) || 0
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [results, searchTerm, hideZero, sortConfig])

  const totalAmount = useMemo(() => {
    return filteredResults.reduce((sum, bill) => sum + (parseInt(bill.total) || 0), 0)
  }, [filteredResults])

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBills(new Set(filteredResults.map(bill => bill.key)))
    } else {
      setSelectedBills(new Set())
    }
  }

  const handleSelectBill = (billKey: string, checked: boolean) => {
    const newSelected = new Set(selectedBills)
    if (checked) {
      newSelected.add(billKey)
    } else {
      newSelected.delete(billKey)
    }
    setSelectedBills(newSelected)
  }

  const handleImportToWarehouse = async () => {
    const selectedBillData = filteredResults.filter(bill => selectedBills.has(bill.key))
    
    if (selectedBillData.length === 0) {
      alert('Vui lòng chọn ít nhất một hóa đơn để nhập kho')
      return
    }

    setIsImporting(true)
    try {
      const billsToImport = selectedBillData.map(bill => ({
        ...bill,
        nhap: new Date().toISOString()
      }))

      const response = await fetch('/api/warehouse/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bills: billsToImport })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Lỗi nhập kho')
      }

      alert(`Đã nhập ${result.added} hóa đơn mới vào kho. Tổng: ${result.total}`)
      setSelectedBills(new Set())
    } catch (error: any) {
      alert(`Lỗi nhập kho: ${error.message}`)
    } finally {
      setIsImporting(false)
    }
  }

  const handleExportExcel = () => {
    // This would require xlsx library - simplified for now
    const csvContent = [
      ['STT', 'Tên KH', 'Địa chỉ', 'Mã KH', 'Kỳ trước', 'Kỳ này', 'Tổng cộng'].join(','),
      ...filteredResults.map((bill, index) => [
        index + 1,
        `"${bill.name}"`,
        `"${bill.address}"`,
        bill.account,
        parseInt(bill.amount_previous || '0') / 100000,
        parseInt(bill.amount_current || '0') / 100000,
        parseInt(bill.total || '0') / 100000
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `bill-results-${Date.now()}.csv`
    link.click()
  }

  const handleCopyToClipboard = async () => {
    const textContent = filteredResults.map((bill, index) => 
      [
        index + 1,
        bill.name,
        bill.address,
        bill.account,
        formatMoney(bill.amount_previous || '0'),
        formatMoney(bill.amount_current || '0'),
        formatMoney(bill.total)
      ].join('\t')
    ).join('\n')

    try {
      await navigator.clipboard.writeText(textContent)
      alert('Đã sao chép vào clipboard')
    } catch (error) {
      alert('Lỗi sao chép: ' + error)
    }
  }

  if (results.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Chưa có kết quả</h3>
            <p className="text-muted-foreground">Bắt đầu tra cứu để xem kết quả</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Kết quả tra cứu ({filteredResults.length})</CardTitle>
        <CardDescription>
          Tổng tiền: <span className="font-bold text-green-600">{formatMoney(totalAmount)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hideZero"
                checked={hideZero}
                onCheckedChange={(checked) => setHideZero(checked === true)}
              />
              <Label htmlFor="hideZero" className="text-sm">Ẩn 0₫</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Sao chép
            </Button>
            {selectedBills.size > 0 && (
              <Button 
                size="sm" 
                onClick={handleImportToWarehouse}
                disabled={isImporting}
              >
                <Archive className="h-4 w-4 mr-2" />
                {isImporting ? 'Đang nhập...' : `Nhập kho (${selectedBills.size})`}
              </Button>
            )}
          </div>
        </div>

        {/* Results Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedBills.size === filteredResults.length && filteredResults.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                  />
                </TableHead>
                <TableHead className="w-16">STT</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Tên KH
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Mã KH</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('amount_previous')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Kỳ trước
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('amount_current')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Kỳ này
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Tổng cộng
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((bill, index) => (
                <TableRow key={bill.key}>
                  <TableCell>
                    <Checkbox
                      checked={selectedBills.has(bill.key)}
                      onCheckedChange={(checked) => handleSelectBill(bill.key, checked === true)}
                    />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{bill.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{bill.address}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{bill.account}</code>
                  </TableCell>
                  <TableCell className="text-right">{formatMoney(bill.amount_previous || '0')}</TableCell>
                  <TableCell className="text-right">{formatMoney(bill.amount_current || '0')}</TableCell>
                  <TableCell className="text-right font-bold">
                    <span className={parseInt(bill.total) > 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatMoney(bill.total)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredResults.length === 0 && results.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Không tìm thấy kết quả phù hợp với bộ lọc
          </div>
        )}
      </CardContent>
    </Card>
  )
}