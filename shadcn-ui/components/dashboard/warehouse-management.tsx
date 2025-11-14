"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Package, PackageOpen, Trash2, Loader2 } from "lucide-react"
import { formatMoney, formatDate } from "@/lib/utils"

interface WarehouseItem {
  id: string
  key: string
  account: string
  name: string
  address: string
  total: string
  imported_at: string
  exported_at: string | null
}

interface WarehouseManagementProps {
  selectedBills: any[]
  user: { role: string }
  onWarehouseOpen: () => void
}

export function WarehouseManagement({ selectedBills, user, onWarehouseOpen }: WarehouseManagementProps) {
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadWarehousePreview()
  }, [])

  const loadWarehousePreview = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouse')
        .select('*')
        .is('exported_at', null)
        .order('imported_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setWarehouseItems(data || [])
    } catch (error: any) {
      console.error('Error loading warehouse preview:', error)
    }
  }

  const importToWarehouse = async () => {
    if (!selectedBills.length) {
      toast({
        title: "Lỗi",
        description: "Chọn các hóa đơn để nhập kho.",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    try {
      const billsToImport = selectedBills.map(bill => ({
        key: bill.key,
        account: bill.account,
        provider_id: bill.provider_id,
        name: bill.name || '-',
        address: bill.address || '-',
        amount_current: bill.amount_current,
        amount_previous: bill.amount_previous,
        total: bill.total,
        imported_at: new Date().toISOString(),
        raw_data: bill.raw_data
      }))

      const { data, error } = await supabase
        .from('warehouse')
        .upsert(billsToImport, { 
          onConflict: 'key',
          ignoreDuplicates: true 
        })
        .select()

      if (error) throw error

      toast({
        title: "Nhập kho thành công",
        description: `Đã nhập ${data?.length || 0} hóa đơn vào kho.`,
      })

      loadWarehousePreview()
    } catch (error: any) {
      toast({
        title: "Lỗi nhập kho",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const removeFromWarehouse = async (keys: string[]) => {
    if (!keys.length) return

    try {
      const { error } = await supabase
        .from('warehouse')
        .delete()
        .in('key', keys)

      if (error) throw error

      toast({
        title: "Xóa thành công",
        description: `Đã xóa ${keys.length} hóa đơn khỏi kho.`,
      })

      loadWarehousePreview()
    } catch (error: any) {
      toast({
        title: "Lỗi xóa",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Quản lý KHO
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={importToWarehouse}
            disabled={isImporting || !selectedBills.length}
            className="flex-1"
          >
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PackageOpen className="mr-2 h-4 w-4" />
            )}
            Nhập vào KHO
          </Button>
          
          {user.role === 'admin' && (
            <Button
              variant="destructive"
              onClick={() => {
                // This would be implemented with selected items
                toast({
                  title: "Chức năng đang phát triển",
                  description: "Chọn các mục trong bảng để xóa.",
                })
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={onWarehouseOpen}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Package className="mr-2 h-4 w-4" />
          )}
          Mở KHO ({warehouseItems.length}+)
        </Button>

        {warehouseItems.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {warehouseItems.map((item) => (
              <div key={item.id} className="border rounded p-2 text-sm">
                <div className="font-medium">{item.name}</div>
                <div className="text-muted-foreground">
                  {item.account} - {formatMoney(item.total)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Nhập: {formatDate(item.imported_at)}
                </div>
              </div>
            ))}
            <div className="text-center text-sm text-muted-foreground">
              ... nhấn "Mở KHO" để xem tất cả
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}