"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Search, Filter, Loader2 } from "lucide-react"

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
}

interface BillLookupProps {
  onResults: (results: BillData[]) => void
}

const PROVIDERS = [
  { value: "00906815", label: "Điện lực miền Nam" },
  { value: "00906819", label: "Điện lực miền Bắc" },
  { value: "00906818", label: "Điện EVNHCMC" },
  { value: "00906820", label: "Điện EVN Hà Nội" },
  { value: "00906817", label: "Điện An Giang" },
]

export function BillLookup({ onResults }: BillLookupProps) {
  const [provider, setProvider] = useState("00906815")
  const [accounts, setAccounts] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFilterDuplicates = () => {
    const lines = accounts.split('\n')
      .map(s => s.trim())
      .filter((v, i, a) => v && a.indexOf(v) === i)
    setAccounts(lines.join('\n'))
  }

  const handleLookup = async () => {
    const codes = accounts.split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 5)

    if (!codes.length) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã khách hàng.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const results: BillData[] = []

    try {
      // Check if provider is Port 2 (8 digits) or Port 1 (PB format)
      const isPort2 = /^\d{8}$/.test(provider)

      for (let i = 0; i < codes.length; i++) {
        const code = codes[i]
        
        try {
          let response
          if (isPort2) {
            // Port 2 API call
            response = await fetch('/api/check-electricity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contract_number: code,
                sku: provider
              }),
            })
          } else {
            // Port 1 API call
            if (!/^P[A-Z0-9]{12}$/i.test(code)) {
              throw new Error('Mã không hợp lệ cho Cổng 1 (phải là PB...)')
            }
            
            response = await fetch('/api/get-bill', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                account: code.toUpperCase(),
                product_id: provider
              }),
            })
          }

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Lỗi ${response.status}`)
          }

          const data = await response.json()
          
          // Normalize response based on port
          let normalized: BillData
          if (isPort2) {
            normalized = normalizePort2Response(data, code, provider)
          } else {
            normalized = normalizePort1Response(data, code, provider)
          }
          
          results.push(normalized)
        } catch (error: any) {
          console.error(`Error looking up ${code}:`, error)
          results.push({
            key: `${provider}::${code}`,
            account: code,
            name: `(Mã ${code})`,
            address: error.message,
            amount_current: '0',
            amount_previous: '0',
            total: '0',
            provider_id: provider,
            raw_data: { error: error.message }
          })
        }

        // Update results progressively
        onResults([...results])
        
        if (i < codes.length - 1) {
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, isPort2 ? 500 : 2000))
        }
      }

      toast({
        title: "Tra cứu hoàn tất",
        description: `Đã tra cứu ${results.length} mã khách hàng.`,
      })
    } catch (error: any) {
      toast({
        title: "Lỗi tra cứu",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Tra Cứu Hóa Đơn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="provider">Nhà cung cấp:</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accounts">Mã khách hàng (mỗi dòng một mã):</Label>
          <Textarea
            id="accounts"
            value={accounts}
            onChange={(e) => setAccounts(e.target.value)}
            placeholder="Nhập mã KH (PB/PA... hoặc số thuê bao)"
            rows={4}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleFilterDuplicates}
            className="flex-1"
          >
            <Filter className="h-4 w-4 mr-2" />
            Lọc trùng
          </Button>
        </div>

        <Button
          onClick={handleLookup}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tra cứu...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Tra cứu
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

function normalizePort1Response(data: any, account: string, provider_id: string): BillData {
  const bills = Array.isArray(data.bills) ? data.bills : []
  const curr = +data.statement_closing || +bills[0]?.amount || 0
  const prev = +bills[1]?.amount || 0
  const total = +data.total_bill_amount || curr

  return {
    key: `${provider_id}::${account}`,
    account: account,
    name: data.name || '-',
    address: data.address || '-',
    amount_current: String(curr),
    amount_previous: String(prev),
    total: String(total),
    provider_id,
    raw_data: data
  }
}

function normalizePort2Response(data: any, account: string, provider_id: string): BillData {
  // Handle Port 2 response structure
  if (data.success && data.data && data.data.success && data.data.data && data.data.data.bills) {
    if (data.data.data.bills.length > 0) {
      const bill = data.data.data.bills[0]
      return {
        key: `${provider_id}::${account}`,
        account: account,
        name: bill.customerName || '-',
        address: bill.address || '-',
        amount_current: String(bill.moneyAmount || '0'),
        amount_previous: '0',
        total: String(bill.moneyAmount || '0'),
        provider_id,
        raw_data: data.data.data
      }
    } else {
      return {
        key: `${provider_id}::${account}`,
        account: account,
        name: `(Mã ${account})`,
        address: 'Không nợ cước',
        amount_current: '0',
        amount_previous: '0',
        total: '0',
        provider_id,
        raw_data: data.data.data
      }
    }
  }

  // Handle error cases
  let errorMsg = data.error?.message || data.details || 'Lỗi tra cứu C2'
  if (data.data && data.data.error) {
    errorMsg = data.data.error.message || 'Lỗi không xác định C2'
  }

  return {
    key: `${provider_id}::${account}`,
    account: account,
    name: `(Mã ${account})`,
    address: errorMsg,
    amount_current: '0',
    amount_previous: '0',
    total: '0',
    provider_id,
    raw_data: { error: errorMsg }
  }
}