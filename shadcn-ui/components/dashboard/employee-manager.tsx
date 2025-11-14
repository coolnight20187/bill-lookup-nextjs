'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, Settings } from 'lucide-react'

interface EmployeeManagerProps {
  userRole: 'admin' | 'user'
}

export function EmployeeManager({ userRole }: EmployeeManagerProps) {
  if (userRole !== 'admin') {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Không có quyền truy cập</h3>
            <p className="text-muted-foreground">Chỉ Admin mới có thể quản lý nhân viên</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quản lý Nhân viên
          </CardTitle>
          <CardDescription>
            Quản lý tài khoản và thông tin nhân viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Đang phát triển</h3>
            <p className="text-muted-foreground mb-4">
              Tính năng quản lý nhân viên sẽ được bổ sung trong phiên bản tiếp theo
            </p>
            <Button disabled>
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm nhân viên
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}