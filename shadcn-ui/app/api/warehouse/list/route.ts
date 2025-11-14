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

export async function GET(request: NextRequest) {
  const user = getUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'Chưa đăng nhập' },
      { status: 401 }
    )
  }

  try {
    const result = await query(
      'SELECT * FROM kho WHERE xuatAt IS NULL ORDER BY nhapAt DESC'
    )

    return NextResponse.json(result.rows)
  } catch (error: any) {
    console.error('Warehouse list error:', error)
    return NextResponse.json(
      { error: error.message || 'Lỗi tải danh sách kho' },
      { status: 500 }
    )
  }
}