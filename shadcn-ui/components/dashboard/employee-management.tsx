"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Users, UserPlus, Edit, Trash2, Search, Loader2 } from "lucide-react"

interface Employee {
  id: string
  username: string
  role: string
  full_name: string | null
  phone: string | null
  is_active: boolean
}

interface EmployeeManagementProps {
  user: { role: string }
}

export function EmployeeManagement({ user }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user",
    full_name: "",
    phone: "",
  })

  const loadEmployees = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('employees')
        .select('id, username, role, full_name, phone, is_active')
        .eq('is_active', true)
        .order('username')

      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setEmployees(data || [])
    } catch (error: any) {
      toast({
        title: "Lỗi tải danh sách nhân viên",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, toast])

  useEffect(() => {
    if (user.role === 'admin') {
      loadEmployees()
    }
  }, [user.role, loadEmployees])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username || (!selectedEmployee && !formData.password)) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc.",
        variant: "destructive",
      })
      return
    }

    try {
      if (selectedEmployee) {
        // Update employee
        const updateData: any = {
          username: formData.username,
          role: formData.role,
          full_name: formData.full_name || null,
          phone: formData.phone || null,
        }

        if (formData.password) {
          // In a real app, you'd hash the password
          updateData.password_hash = formData.password
        }

        const { error } = await supabase
          .from('employees')
          .update(updateData)
          .eq('id', selectedEmployee.id)

        if (error) throw error

        toast({
          title: "Cập nhật thành công",
          description: "Thông tin nhân viên đã được cập nhật.",
        })
      } else {
        // Create new employee
        const { error } = await supabase
          .from('employees')
          .insert({
            username: formData.username,
            password_hash: formData.password, // In real app, hash this
            role: formData.role,
            full_name: formData.full_name || null,
            phone: formData.phone || null,
          })

        if (error) throw error

        toast({
          title: "Thêm thành công",
          description: "Nhân viên mới đã được thêm.",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      loadEmployees()
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
      username: "",
      password: "",
      role: "user",
      full_name: "",
      phone: "",
    })
    setSelectedEmployee(null)
  }

  const editEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormData({
      username: employee.username,
      password: "",
      role: employee.role,
      full_name: employee.full_name || "",
      phone: employee.phone || "",
    })
    setIsDialogOpen(true)
  }

  const deleteEmployee = async (employee: Employee) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhân viên "${employee.username}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: false })
        .eq('id', employee.id)

      if (error) throw error

      toast({
        title: "Xóa thành công",
        description: "Nhân viên đã được xóa.",
      })

      loadEmployees()
    } catch (error: any) {
      toast({
        title: "Lỗi xóa",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (user.role !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quản lý Nhân Viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Chỉ quản trị viên mới có quyền truy cập chức năng này.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Quản lý Nhân Viên
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Tìm tên nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadEmployees()}
            />
          </div>
          <Button variant="outline" onClick={loadEmployees} disabled={isLoading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm Nhân Viên
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedEmployee ? 'Sửa Nhân Viên' : 'Thêm Nhân Viên Mới'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu {selectedEmployee ? '(để trống nếu không đổi)' : '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!selectedEmployee}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Quyền *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Nhân Viên</SelectItem>
                    <SelectItem value="admin">Quản Trị Viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Họ và Tên</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Hủy
                </Button>
                <Button type="submit" className="flex-1">
                  {selectedEmployee ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{employee.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {employee.full_name || 'Chưa có tên'} - {employee.role}
                  </div>
                  {employee.phone && (
                    <div className="text-xs text-muted-foreground">{employee.phone}</div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editEmployee(employee)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteEmployee(employee)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {employees.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Không tìm thấy nhân viên nào.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}