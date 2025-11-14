'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCheck, UserPlus, Settings } from 'lucide-react'

interface CustomerManagerProps {
  userRole: 'admin' | 'user'
  userId: number
  username: string
}

export function CustomerManager({ userRole, userId, username }: CustomerManagerProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Quản lý Khách hàng
          </CardTitle>
          <CardDescription>
            Quản lý thông tin khách hàng và bán hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Đang phát triển</h3>
            <p className="text-muted-foreground mb-4">
              Tính năng quản lý khách hàng sẽ được bổ sung trong phiên bản tiếp theo
            </p>
            <Button disabled>
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm khách hàng
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}