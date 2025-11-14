"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { CreditCard, UserPlus, Edit, ShoppingCart, History, Loader2 } from "lucide-react"

interface Member {
  id: string
  name: string
  zalo: string | null
  bank: string | null
}

interface CustomerManagementProps {
  user: { role: string; id: string; username: string }
  selectedBills: any[]
  onSellComplete?: () => void
  onHistoryOpen: () => void
}

export function CustomerManagement({ user, selectedBills, onSellComplete, onHistoryOpen }: CustomerManagementProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMemberId, setSelectedMemberId] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSelling, setIsSelling] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    zalo: "",
    bank: "",
  })

  // Filter controls
  const [priceFrom, setPriceFrom] = useState("")
  const [priceTo, setPriceTo] = useState("")

  const loadMembers = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name')

      if (error) throw error
      setMembers(data || [])
    } catch (error: any) {
      toast({
        title: "Lỗi tải khách hàng",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const filterMembers = useCallback(() => {
    let filtered = members
    if (searchTerm) {
      filtered = members.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredMembers(filtered)
  }, [members, searchTerm])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  useEffect(() => {
    filterMembers()
  }, [filterMembers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast({
        title: "Lỗi",
        description: "Tên khách hàng là bắt buộc.",
        variant: "destructive",
      })
      return
    }

    try {
      if (selectedMember) {
        // Update member
        const { error } = await supabase
          .from('members')
          .update({
            name: formData.name,
            zalo: formData.zalo || null,
            bank: formData.bank || null,
          })
          .eq('id', selectedMember.id)

        if (error) throw error

        toast({
          title: "Cập nhật thành công",
          description: "Thông tin khách hàng đã được cập nhật.",
        })
      } else {
        // Create new member
        const { error } = await supabase
          .from('members')
          .insert({
            name: formData.name,
            zalo: formData.zalo || null,
            bank: formData.bank || null,
          })

        if (error) throw error

        toast({
          title: "Thêm thành công",
          description: "Khách hàng mới đã được thêm.",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      loadMembers()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      zalo: "",
      bank: "",
    })
    setSelectedMember(null)
  }

  const editMember = (member: Member) => {
    setSelectedMember(member)
    setFormData({
      name: member.name,
      zalo: member.zalo || "",
      bank: member.bank || "",
    })
    setIsDialogOpen(true)
  }

  const sellBills = async () => {
    if (!selectedBills.length) {
      toast({
        title: "Lỗi",
        description: "Chọn hóa đơn để bán.",
        variant: "destructive",
      })
      return
    }

    if (!selectedMemberId) {
      toast({
        title: "Lỗi",
        description: "Chọn khách hàng thẻ.",
        variant: "destructive",
      })
      return
    }

    const member = members.find(m => m.id === selectedMemberId)
    if (!member) return

    setIsSelling(true)
    try {
      const soldAt = new Date().toISOString()
      
      // Create transaction history records
      const transactions = selectedBills.map(bill => ({
        account: bill.account,
        provider_id: bill.provider_id,
        name: bill.name,
        address: bill.address,
        amount_current: bill.amount_current,
        amount_previous: bill.amount_previous,
        total: bill.total,
        imported_at: bill.imported_at || soldAt,
        sold_at: soldAt,
        member_id: selectedMemberId,
        member_name: member.name,
        employee_id: user.id,
        employee_username: user.username,
        raw_data: bill.raw_data
      }))

      const { error: historyError } = await supabase
        .from('transaction_history')
        .insert(transactions)

      if (historyError) throw historyError

      // Mark warehouse items as exported
      const billKeys = selectedBills.map(b => b.key)
      const { error: warehouseError } = await supabase
        .from('warehouse')
        .update({ exported_at: soldAt })
        .in('key', billKeys)

      if (warehouseError) throw warehouseError

      toast({
        title: "Bán hàng thành công",
        description: `Đã bán ${selectedBills.length} hóa đơn cho ${member.name}.`,
      })

      onSellComplete?.()
    } catch (error: any) {
      toast({
        title: "Lỗi bán hàng",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSelling(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Khách Hàng & Bán Hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Management */}
        <div className="space-y-2">
          <h6 className="font-semibold text-sm">Khách Hàng Thẻ</h6>
          
          {user.role === 'admin' && (
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={resetForm} className="flex-1">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Thêm
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedMember ? 'Sửa Khách Hàng' : 'Thêm Khách Hàng Mới'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tên khách hàng *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zalo">Zalo</Label>
                      <Input
                        id="zalo"
                        value={formData.zalo}
                        onChange={(e) => setFormData({...formData, zalo: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bank">Ngân hàng</Label>
                      <Input
                        id="bank"
                        value={formData.bank}
                        onChange={(e) => setFormData({...formData, bank: e.target.value})}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                        Hủy
                      </Button>
                      <Button type="submit" className="flex-1">
                        {selectedMember ? 'Cập nhật' : 'Thêm mới'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  if (selectedMemberId) {
                    const member = members.find(m => m.id === selectedMemberId)
                    if (member) editMember(member)
                  } else {
                    toast({
                      title: "Chọn khách hàng",
                      description: "Vui lòng chọn khách hàng để sửa.",
                      variant: "destructive",
                    })
                  }
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Input
            placeholder="Tìm tên khách hàng (Enter)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && filterMembers()}
          />

          <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn khách hàng thẻ" />
            </SelectTrigger>
            <SelectContent>
              {filteredMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} (Z:{member.zalo || 'N/A'}) (B:{member.bank || 'N/A'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <hr />

        {/* Sales & History */}
        <div className="space-y-2">
          <h6 className="font-semibold text-sm">Bán Hàng & Lịch sử</h6>
          
          <Label className="text-xs">Lọc Bill KHO (Từ → Đến):</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Từ"
              type="number"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Đến"
              type="number"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="sm">
              Lọc
            </Button>
          </div>

          <Button
            onClick={sellBills}
            disabled={isSelling || !selectedBills.length}
            className="w-full"
          >
            {isSelling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            Bán ({selectedBills.length})
          </Button>

          <Button variant="outline" className="w-full" onClick={onHistoryOpen}>
            <History className="mr-2 h-4 w-4" />
            Mở Lịch sử
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}