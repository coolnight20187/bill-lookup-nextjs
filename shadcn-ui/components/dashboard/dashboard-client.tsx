'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Clock, Zap, Users, Package, DollarSign, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatMoney, formatDate } from '@/lib/utils'

interface BillData {
  success: boolean
  data?: {
    account: string
    customer_name: string
    address: string
    amount: number
    due_date: string
    status: string
  }
  error?: string
}

export function DashboardClient() {
  const [activeTab, setActiveTab] = useState('lookup')
  const [isLoading, setIsLoading] = useState(false)
  const [billData, setBillData] = useState<BillData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [account, setAccount] = useState('')
  const [productId, setProductId] = useState('')
  const [contractNumber, setContractNumber] = useState('')
  const [sku, setSku] = useState('')

  // Mock data for dashboard
  const [dashboardStats] = useState({
    totalBills: 1247,
    paidBills: 1089,
    pendingBills: 158,
    totalRevenue: 2847392000,
    monthlyGrowth: 12.5
  })

  const handleGateway1Lookup = async () => {
    if (!account || !productId) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setIsLoading(true)
    setError(null)
    setBillData(null)

    try {
      const response = await fetch('/api/get-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: account.trim(),
          product_id: productId.trim()
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setBillData(data)
      } else {
        setError(data.error || 'Có lỗi xảy ra khi tra cứu')
      }
    } catch (err) {
      setError('Lỗi kết nối đến server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGateway2Lookup = async () => {
    if (!contractNumber || !sku) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setIsLoading(true)
    setError(null)
    setBillData(null)

    try {
      const response = await fetch('/api/check-electricity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contract_number: contractNumber.trim(),
          sku: sku.trim()
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setBillData(data)
      } else {
        setError(data.error || 'Có lỗi xảy ra khi tra cứu')
      }
    } catch (err) {
      setError('Lỗi kết nối đến server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Hệ thống tra cứu hóa đơn điện</h1>
          <p className="text-muted-foreground">Quản lý và tra cứu thông tin hóa đơn điện</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="lookup">Tra cứu hóa đơn</TabsTrigger>
            <TabsTrigger value="warehouse">Kho hàng</TabsTrigger>
            <TabsTrigger value="employees">Nhân viên</TabsTrigger>
            <TabsTrigger value="customers">Khách hàng</TabsTrigger>
            <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
          </TabsList>

          <TabsContent value="lookup" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Gateway 1 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    API Gateway 1
                  </CardTitle>
                  <CardDescription>
                    Tra cứu hóa đơn qua hệ thống cũ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="account">Số tài khoản</Label>
                    <Input
                      id="account"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      placeholder="Nhập số tài khoản"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productId">Product ID</Label>
                    <Input
                      id="productId"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      placeholder="Nhập product ID"
                    />
                  </div>
                  <Button 
                    onClick={handleGateway1Lookup}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Đang tra cứu...' : 'Tra cứu Gateway 1'}
                  </Button>
                </CardContent>
              </Card>

              {/* Gateway 2 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    API Gateway 2
                  </CardTitle>
                  <CardDescription>
                    Tra cứu hóa đơn qua hệ thống mới (7ty.vn)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractNumber">Số hợp đồng</Label>
                    <Input
                      id="contractNumber"
                      value={contractNumber}
                      onChange={(e) => setContractNumber(e.target.value)}
                      placeholder="Nhập số hợp đồng"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Nhập SKU"
                    />
                  </div>
                  <Button 
                    onClick={handleGateway2Lookup}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Đang tra cứu...' : 'Tra cứu Gateway 2'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {billData && billData.success && billData.data && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Thông tin hóa đơn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Số tài khoản</Label>
                      <p className="text-lg">{billData.data.account}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tên khách hàng</Label>
                      <p className="text-lg">{billData.data.customer_name}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Địa chỉ</Label>
                      <p className="text-lg">{billData.data.address}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Số tiền</Label>
                      <p className="text-lg font-bold text-green-600">
                        {formatMoney(billData.data.amount)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Hạn thanh toán</Label>
                      <p className="text-lg">{formatDate(billData.data.due_date)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Trạng thái</Label>
                      <div className="mt-1">
                        <Badge variant={billData.data.status === 'paid' ? 'default' : 'destructive'}>
                          {billData.data.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="warehouse" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">+12% từ tháng trước</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sản phẩm tồn kho</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">-5% từ tháng trước</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sản phẩm hết hàng</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">Cần nhập thêm</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Giá trị kho</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatMoney(5847392000)}</div>
                  <p className="text-xs text-muted-foreground">+8% từ tháng trước</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng nhân viên</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-muted-foreground">+2 nhân viên mới</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Đang làm việc</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-muted-foreground">89% tỷ lệ tham gia</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nghỉ phép</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Trong tuần này</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng khách hàng</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12,847</div>
                  <p className="text-xs text-muted-foreground">+15% từ tháng trước</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Khách hàng mới</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">234</div>
                  <p className="text-xs text-muted-foreground">Trong tháng này</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Khách hàng VIP</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,847</div>
                  <p className="text-xs text-muted-foreground">14% tổng khách hàng</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Doanh thu/KH</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatMoney(2847392)}</div>
                  <p className="text-xs text-muted-foreground">Trung bình/tháng</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng giao dịch</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalBills.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+{dashboardStats.monthlyGrowth}% từ tháng trước</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.paidBills.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((dashboardStats.paidBills / dashboardStats.totalBills) * 100)}% tỷ lệ thanh toán
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chưa thanh toán</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.pendingBills.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Cần theo dõi</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatMoney(dashboardStats.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">+{dashboardStats.monthlyGrowth}% từ tháng trước</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}