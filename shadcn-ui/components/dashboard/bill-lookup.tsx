'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Search, Filter, Zap } from 'lucide-react'
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
}

interface BillLookupProps {
  onResults: (results: BillData[]) => void
}

export function BillLookup({ onResults }: BillLookupProps) {
  const [provider, setProvider] = useState('00906815')
  const [accounts, setAccounts] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const providers = [
    { value: '00906815', label: 'Điện lực miền Nam' },
    { value: '00906819', label: 'Điện lực miền Bắc' },
    { value: '00906818', label: 'Điện EVNHCMC' },
    { value: '00906820', label: 'Điện EVN Hà Nội' },
    { value: '00906817', label: 'Điện An Giang' }
  ]

  const handleFilterDuplicates = () => {
    const lines = accounts.split('\n')
      .map(s => s.trim())
      .filter((v, i, a) => v && a.indexOf(v) === i)
    setAccounts(lines.join('\n'))
  }

  const normalizeResponse = (response: any, account: string, providerId: string): BillData => {
    const data = response.data || {}
    const bills = Array.isArray(data.bills) ? data.bills : []
    const curr = Number(data.statement_closing || bills[0]?.amount || 0)
    const prev = Number(bills[1]?.amount || 0)
    const total = Number(data.total_bill_amount || curr)

    return {
      key: `${providerId}::${account}`,
      account: data.account || account,
      name: data.name || '-',
      address: data.address || '-',
      amount_current: String(curr),
      amount_previous: String(prev),
      total: String(total),
      provider_id: providerId,
      raw: data
    }
  }

  const normalizeResponsePort2 = (response: any, account: string): BillData => {
    const providerId = 'C2-7ty.vn'
    
    if (response.success && response.data?.success && response.data.data?.bills) {
      if (response.data.data.bills.length > 0) {
        const bill = response.data.data.bills[0]
        return {
          key: `${providerId}::${account}`,
          account,
          name: bill.customerName || '-',
          address: bill.address || '-',
          amount_current: String(bill.moneyAmount || 0),
          amount_previous: '0',
          total: String(bill.moneyAmount || 0),
          provider_id: providerId,
          raw: response.data.data
        }
      } else {
        return {
          key: `${providerId}::${account}`,
          account,
          name: `(Mã ${account})`,
          address: 'Không nợ cước',
          amount_current: '0',
          amount_previous: '0',
          total: '0',
          provider_id: providerId,
          raw: response.data.data
        }
      }
    }

    // Error case
    let errorMsg = response.error?.message || response.details || 'Lỗi tra cứu C2'
    if (response.data?.error) {
      errorMsg = response.data.error.message || 'Lỗi không xác định C2'
    }
    if (response.error && (response.error.code === 'PAYBILL_QUERY_ERROR-01' || response.error === 'Khách hàng không nợ cước')) {
      errorMsg = "Không nợ cước"
    }

    return {
      key: `${providerId}::${account}`,
      account,
      name: `(Mã ${account})`,
      address: errorMsg,
      amount_current: '0',
      amount_previous: '0',
      total: '0',
      provider_id: providerId,
      raw: { error: errorMsg }
    }
  }

  const handleLookup = async () => {
    const codes = accounts.split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 5)

    if (!codes.length) {
      setError('Vui lòng nhập mã khách hàng.')
      return
    }

    setIsLoading(true)
    setError('')
    const results: BillData[] = []

    try {
      // Check if using Gateway 2 (numeric SKU)
      const isPort2 = /^\d{8}$/.test(provider)

      if (isPort2) {
        // Gateway 2 logic
        for (let i = 0; i < codes.length; i++) {
          try {
            const response = await fetch('/api/check-electricity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contract_number: codes[i],
                sku: provider
              })
            })

            const data = await response.json()
            const normalized = normalizeResponsePort2(data, codes[i])
            results.push(normalized)
          } catch (err: any) {
            console.error(`Error looking up ${codes[i]}:`, err)
            results.push(normalizeResponsePort2({ error: { message: err.message } }, codes[i]))
          }

          // Update results progressively
          onResults([...results])
          
          if (i < codes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }
      } else {
        // Gateway 1 logic
        const port1Codes = codes.filter(s => /^P[A-Z0-9]{12}$/i.test(s))
        
        if (codes.length > 0 && port1Codes.length === 0) {
          setError('Các mã bạn nhập không hợp lệ cho Gateway 1 (phải là PB...).')
          return
        }

        for (let i = 0; i < port1Codes.length; i++) {
          try {
            const response = await fetch('/api/get-bill', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                account: port1Codes[i].toUpperCase(),
                product_id: provider
              })
            })

            const data = await response.json()
            const normalized = normalizeResponse(data, port1Codes[i], provider)
            results.push(normalized)
          } catch (err: any) {
            console.error(`Error looking up ${port1Codes[i]}:`, err)
            results.push(normalizeResponse(
              { data: { name: `(Mã ${port1Codes[i]})`, address: err.message } },
              port1Codes[i],
              provider
            ))
          }

          // Update results progressively
          onResults([...results])
          
          if (i < port1Codes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }
      }

      onResults(results)
    } catch (err: any) {
      setError(`Lỗi tra cứu: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Tra Cứu Hóa Đơn
        </CardTitle>
        <CardDescription>
          Tra cứu hóa đơn điện qua 2 cổng API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="provider">Nhà cung cấp:</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accounts">Mã khách hàng:</Label>
          <Textarea
            id="accounts"
            value={accounts}
            onChange={(e) => setAccounts(e.target.value)}
            placeholder="Nhập mã KH (PB/PA... cho Gateway 1, số hợp đồng cho Gateway 2)"
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFilterDuplicates}
            className="flex-1"
          >
            <Filter className="h-4 w-4 mr-2" />
            Lọc trùng
          </Button>
        </div>

        <Button
          onClick={handleLookup}
          disabled={isLoading || !accounts.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tra cứu...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Tra cứu
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}