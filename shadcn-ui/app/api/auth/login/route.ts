import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { username, password, rememberMe } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Thiếu tên đăng nhập hoặc mật khẩu' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(username, password)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Tên đăng nhập hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    // Set session cookie
    const cookieStore = cookies()
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day
    
    cookieStore.set('session', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge
    })

    return NextResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Lỗi máy chủ nội bộ' },
      { status: 500 }
    )
  }
}