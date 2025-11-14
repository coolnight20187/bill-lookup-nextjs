'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatMoney, formatDate, parseMoney } from "@/lib/utils"
import { Search, Download, Copy, Eye, Grid3X3, List, ChevronLeft, ChevronRight } from "lucide-react"

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

interface ResultsTableProps {
  results: BillData[]
  onImportSelected?: (selected: BillData[]) => void
  showImportButton?: boolean
}

export function ResultsTable({ results, onImportSelected, showImportButton = true }: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [currentPage, setCurrentPage] = useState(1)
  const [hideZero, setHideZero] = useState(false)
  const itemsPerPage = 50

  // Filter results
  const filteredResults = useMemo(() => {
    return results.filter(item => {
      if (hideZero && parseMoney(item.total) === 0) return false
      
      if (!searchTerm) return true
      
      const search = searchTerm.toLowerCase()
      return (
        item.name.toLowerCase().includes(search) ||
        item.address.toLowerCase().includes(search) ||
        item.account.toLowerCase().includes(search)
      )
    })
  }, [results, searchTerm, hideZero])

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalAmount = filteredResults.reduce((sum, item) => sum + parseMoney(item.total), 0)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(paginatedResults.map(item => item.key)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (key: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(key)
    } else {
      newSelected.delete(key)
    }
    setSelectedItems(newSelected)
  }

  const handleImport = () => {
    const selectedData = filteredResults.filter(item => selectedItems.has(item.key))
    onImportSelected?.(selectedData)
    setSelectedItems(new Set())
  }

  const handleExport = () => {
    const csvContent = [
      ['STT', 'Tên KH', 'Địa chỉ', 'Mã KH', 'Kỳ trước', 'Kỳ này', 'Tổng cộng'].join(','),
      ...filteredResults.map((item, index) => [
        index + 1,
        `"${item.name}"`,
        `"${item.address}"`,
        item.account,
        parseMoney(item.amount_previous || '0') / 100000,
        parseMoney(item.amount_current || '0') / 100000,
        parseMoney(item.total) / 100000
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `bill-results-${Date.now()}.csv`
    link.click()
  }

  const handleCopy = async () => {
    const textContent = filteredResults.map((item, index) => 
      [
        index + 1,
        item.name,
        item.address,
        item.account,
        formatMoney(item.amount_previous || '0'),
        formatMoney(item.amount_current || '0'),
        formatMoney(item.total)
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
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Chưa có kết quả</h3>
            <p className="text-muted-foreground">Bắt đầu tra cứu để xem kết quả</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Kết quả tra cứu ({filteredResults.length})</CardTitle>
            <CardDescription>
              Tổng tiền: <span className="font-bold text-green-600">{formatMoney(totalAmount)}</span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            >
              {viewMode === 'table' ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </Button>
          </div>
        </div>
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
              <label htmlFor="hideZero" className="text-sm">Ẩn 0₫</label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Xuất CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Sao chép
            </Button>
            {showImportButton && selectedItems.size > 0 && (
              <Button size="sm" onClick={handleImport}>
                Nhập kho ({selectedItems.size})
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
                    checked={selectedItems.size === paginatedResults.length && paginatedResults.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                  />
                </TableHead>
                <TableHead className="w-16">STT</TableHead>
                <TableHead>Tên KH</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Mã KH</TableHead>
                <TableHead className="text-right">Kỳ trước</TableHead>
                <TableHead className="text-right">Kỳ này</TableHead>
                <TableHead className="text-right">Tổng cộng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResults.map((item, index) => (
                <TableRow key={item.key}>
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.has(item.key)}
                      onCheckedChange={(checked) => handleSelectItem(item.key, checked === true)}
                    />
                  </TableCell>
                  <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.address}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{item.account}</code>
                  </TableCell>
                  <TableCell className="text-right">{formatMoney(item.amount_previous || '0')}</TableCell>
                  <TableCell className="text-right">{formatMoney(item.amount_current || '0')}</TableCell>
                  <TableCell className="text-right font-bold">
                    <span className={parseMoney(item.total) > 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatMoney(item.total)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Trang {currentPage} / {totalPages} (Tổng: {filteredResults.length})
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {filteredResults.length === 0 && results.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Không tìm thấy kết quả phù hợp với bộ lọc
          </div>
        )}
      </CardContent>
    </Card>
  )
}