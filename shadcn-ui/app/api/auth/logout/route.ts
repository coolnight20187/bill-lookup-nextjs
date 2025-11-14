import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  try {
    const cookieStore = cookies()
    cookieStore.delete('session')
    
    return NextResponse.json({ message: 'Đăng xuất thành công' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Lỗi khi đăng xuất' },
      { status: 500 }
    )
  }
}