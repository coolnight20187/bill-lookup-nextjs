import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query } from '@/lib/database'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getUser() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  
  if (!session) {
    return null
  }
  
  try {
    return JSON.parse(session.value)
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const user = getUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'Chưa đăng nhập' },
      { status: 401 }
    )
  }

  try {
    const { bills } = await request.json()
    
    if (!Array.isArray(bills)) {
      return NextResponse.json(
        { error: 'Thiếu bills (mảng)' },
        { status: 400 }
      )
    }

    let added = 0

    for (const bill of bills) {
      const {
        key,
        account,
        provider_id,
        name = '-',
        address = '-',
        amount_current = '0',
        amount_previous = '0',
        total = '0',
        nhap,
        raw = {}
      } = bill

      if (!key || !account || !provider_id || !nhap) {
        console.warn('Skipping bill due to missing required fields:', bill)
        continue
      }

      const result = await query(
        `INSERT INTO kho (key, account, provider_id, name, address, amount_current, amount_previous, total, nhapAt, raw) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         ON CONFLICT (key) DO NOTHING`,
        [key, account, provider_id, name, address, amount_current, amount_previous, total, nhap, raw]
      )

      if (result.rowCount && result.rowCount > 0) {
        added++
      }
    }

    // Get total count
    const totalResult = await query('SELECT COUNT(*) FROM kho WHERE xuatAt IS NULL')
    const total = totalResult.rows[0].count

    return NextResponse.json({
      ok: true,
      added,
      total: parseInt(total)
    })
  } catch (error: any) {
    console.error('Warehouse import error:', error)
    return NextResponse.json(
      { error: error.message || 'Lỗi nhập kho' },
      { status: 500 }
    )
  }
}