import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const session = cookieStore.get('session')
    
    if (!session) {
      return NextResponse.json(
        { error: 'Chưa đăng nhập' },
        { status: 401 }
      )
    }

    const user = JSON.parse(session.value)
    return NextResponse.json(user)
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'Phiên đăng nhập không hợp lệ' },
      { status: 401 }
    )
  }
}