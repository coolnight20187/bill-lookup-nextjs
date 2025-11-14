"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { formatMoney, formatDate, parseMoney } from "@/lib/utils"
import { Search, Download, Copy, Eye, Grid3X3, List, ChevronLeft, ChevronRight } from "lucide-react"
import * as XLSX from 'xlsx'

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

interface ResultsTableProps {
  data: BillData[]
  onSelectionChange: (selected: BillData[]) => void
  viewMode?: 'lookup' | 'warehouse' | 'history'
}

export function ResultsTable({ data, onSelectionChange, viewMode = 'lookup' }: ResultsTableProps) {
  const [filteredData, setFilteredData] = useState<BillData[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [hideZero, setHideZero] = useState(false)
  const [displayMode, setDisplayMode] = useState<'list' | 'grid'>('list')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null)
  const { toast } = useToast()

  const applyFilters = useCallback(() => {
    let filtered = [...data]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.employee_username && item.employee_username.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Hide zero filter
    if (hideZero) {
      filtered = filtered.filter(item => parseMoney(item.total) > 0)
    }

    // Sort
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof BillData]
        let bValue: any = b[sortConfig.key as keyof BillData]

        if (sortConfig.key === 'total' || sortConfig.key === 'amount_current' || sortConfig.key === 'amount_previous') {
          aValue = parseMoney(aValue)
          bValue = parseMoney(bValue)
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [data, searchTerm, hideZero, sortConfig])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  useEffect(() => {
    const selected = data.filter(item => selectedItems.has(item.key))
    onSelectionChange(selected)
  }, [selectedItems, data, onSelectionChange])

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageItems = getCurrentPageData()
      const newSelected = new Set(Array.from(selectedItems))
      currentPageItems.forEach(item => newSelected.add(item.key))
      setSelectedItems(newSelected)
    } else {
      const currentPageItems = getCurrentPageData()
      const newSelected = new Set(Array.from(selectedItems))
      currentPageItems.forEach(item => newSelected.delete(item.key))
      setSelectedItems(newSelected)
    }
  }

  const handleSelectItem = (key: string, checked: boolean) => {
    const newSelected = new Set(Array.from(selectedItems))
    if (checked) {
      newSelected.add(key)
    } else {
      newSelected.delete(key)
    }
    setSelectedItems(newSelected)
  }

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }

  const getTotalPages = () => Math.ceil(filteredData.length / itemsPerPage)

  const exportToExcel = () => {
    if (filteredData.length === 0) {
      toast({
        title: "Không có dữ liệu",
        description: "Không có dữ liệu để xuất.",
        variant: "destructive",
      })
      return
    }

    const exportData = filteredData.map((item, index) => ({
      'STT': index + 1,
      'Tên KH': item.name,
      'Địa chỉ': item.address,
      'Mã KH': item.account,
      'Kỳ trước': parseMoney(item.amount_previous) / 100000,
      'Kỳ này': parseMoney(item.amount_current) / 100000,
      'Tổng cộng': parseMoney(item.total) / 100000,
      'Ngày nhập KHO': item.imported_at ? formatDate(item.imported_at) : '',
      'Ngày xuất KHO': item.exported_at ? formatDate(item.exported_at) : '',
      'Khách Hàng THẺ': item.member_name || '',
      'Nhân Viên Bán': item.employee_username || '',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSachBill')
    XLSX.writeFile(wb, `DanhSachBill-${Date.now()}.xlsx`)

    toast({
      title: "Xuất file thành công",
      description: "Dữ liệu đã được xuất ra file Excel.",
    })
  }

  const copyToClipboard = async () => {
    const currentPageItems = getCurrentPageData()
    const text = currentPageItems.map(item => [
      item.name,
      item.address,
      item.account,
      formatMoney(item.amount_previous),
      formatMoney(item.amount_current),
      formatMoney(item.total),
      item.imported_at ? formatDate(item.imported_at) : '',
      item.exported_at ? formatDate(item.exported_at) : '',
      item.member_name || '',
      item.employee_username || '',
    ].join('\t')).join('\n')

    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Sao chép thành công",
        description: "Dữ liệu đã được sao chép vào clipboard.",
      })
    } catch (error) {
      toast({
        title: "Lỗi sao chép",
        description: "Không thể sao chép dữ liệu.",
        variant: "destructive",
      })
    }
  }

  const currentPageData = getCurrentPageData()
  const totalPages = getTotalPages()
  const totalAmount = currentPageData.reduce((sum, item) => sum + parseMoney(item.total), 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Bắt đầu bằng cách tra cứu hoặc mở KHO
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search and filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm trong kết quả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hide-zero"
                checked={hideZero}
                onCheckedChange={(checked) => setHideZero(checked as boolean)}
              />
              <label htmlFor="hide-zero" className="text-sm">Ẩn Bill 0₫</label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToExcel}>
                <Download className="h-4 w-4 mr-2" />
                Xuất
              </Button>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Sao chép
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={displayMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDisplayMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={displayMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDisplayMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Pagination controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">Hiển thị:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">
                Trang {currentPage} / {totalPages} ({filteredData.length} mục)
              </span>
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
        </CardContent>
      </Card>

      {/* Results */}
      {displayMode === 'list' ? (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={currentPageData.length > 0 && currentPageData.every(item => selectedItems.has(item.key))}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                    STT
                  </TableHead>
                  <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                    Tên KH
                  </TableHead>
                  <TableHead onClick={() => handleSort('address')} className="cursor-pointer">
                    Địa chỉ
                  </TableHead>
                  <TableHead onClick={() => handleSort('account')} className="cursor-pointer">
                    Mã KH
                  </TableHead>
                  {viewMode === 'lookup' && (
                    <>
                      <TableHead onClick={() => handleSort('amount_previous')} className="cursor-pointer">
                        Kỳ trước
                      </TableHead>
                      <TableHead onClick={() => handleSort('amount_current')} className="cursor-pointer">
                        Kỳ này
                      </TableHead>
                    </>
                  )}
                  <TableHead onClick={() => handleSort('total')} className="cursor-pointer">
                    Tổng cộng
                  </TableHead>
                  {(viewMode === 'warehouse' || viewMode === 'history') && (
                    <>
                      <TableHead>Ngày nhập KHO</TableHead>
                      <TableHead>Ngày xuất KHO</TableHead>
                    </>
                  )}
                  {viewMode === 'history' && (
                    <>
                      <TableHead>Khách Hàng THẺ</TableHead>
                      <TableHead>Nhân Viên Bán</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPageData.map((item, index) => (
                  <TableRow key={item.key}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(item.key)}
                        onCheckedChange={(checked) => handleSelectItem(item.key, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.address}</TableCell>
                    <TableCell>{item.account}</TableCell>
                    {viewMode === 'lookup' && (
                      <>
                        <TableCell>{formatMoney(item.amount_previous)}</TableCell>
                        <TableCell>{formatMoney(item.amount_current)}</TableCell>
                      </>
                    )}
                    <TableCell className="font-medium">{formatMoney(item.total)}</TableCell>
                    {(viewMode === 'warehouse' || viewMode === 'history') && (
                      <>
                        <TableCell>{item.imported_at ? formatDate(item.imported_at) : ''}</TableCell>
                        <TableCell>{item.exported_at ? formatDate(item.exported_at) : ''}</TableCell>
                      </>
                    )}
                    {viewMode === 'history' && (
                      <>
                        <TableCell>{item.member_name || ''}</TableCell>
                        <TableCell>{item.employee_username || ''}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Summary */}
          <div className="border-t p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Đã chọn: {selectedItems.size} mục
              </span>
              <span className="font-medium">
                Tổng tiền (trang này): {formatMoney(totalAmount.toString())}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentPageData.map((item) => (
            <Card key={item.key} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <Checkbox
                    checked={selectedItems.has(item.key)}
                    onCheckedChange={(checked) => handleSelectItem(item.key, checked as boolean)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Mã KH: {item.account}</p>
                <p className="text-sm text-muted-foreground">Địa chỉ: {item.address}</p>
                <p className="text-lg font-bold text-red-600">{formatMoney(item.total)}</p>
                {viewMode === 'lookup' && (
                  <p className="text-sm">
                    Kỳ trước: {formatMoney(item.amount_previous)} | Kỳ này: {formatMoney(item.amount_current)}
                  </p>
                )}
                {item.imported_at && (
                  <p className="text-xs text-muted-foreground">
                    Nhập: {formatDate(item.imported_at)}
                  </p>
                )}
                {item.exported_at && (
                  <p className="text-xs text-muted-foreground">
                    Xuất: {formatDate(item.exported_at)}
                  </p>
                )}
                {item.member_name && (
                  <p className="text-xs text-muted-foreground">
                    KHT: {item.member_name}
                  </p>
                )}
                {item.employee_username && (
                  <p className="text-xs text-muted-foreground">
                    NV Bán: {item.employee_username}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}