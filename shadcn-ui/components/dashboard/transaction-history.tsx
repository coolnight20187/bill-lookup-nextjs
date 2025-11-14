'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { History, Clock, Settings } from 'lucide-react'

interface TransactionHistoryProps {
  userRole: 'admin' | 'user'
}

export function TransactionHistory({ userRole }: TransactionHistoryProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử Giao dịch
          </CardTitle>
          <CardDescription>
            Xem lịch sử các giao dịch bán hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Đang phát triển</h3>
            <p className="text-muted-foreground mb-4">
              Tính năng lịch sử giao dịch sẽ được bổ sung trong phiên bản tiếp theo
            </p>
            <Button disabled>
              <Clock className="mr-2 h-4 w-4" />
              Xem lịch sử
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}