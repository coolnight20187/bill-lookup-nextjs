import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { fetchWithTimeout } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function isAuthenticated(): boolean {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  return !!session
}

function nowSec(): string {
  return Math.floor(Date.now() / 1000).toString()
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json(
      { error: 'Chưa đăng nhập' },
      { status: 401 }
    )
  }

  try {
    const { account, product_id } = await request.json()
    
    if (!account || !product_id) {
      return NextResponse.json(
        { error: 'Thiếu account hoặc product_id' },
        { status: 400 }
      )
    }

    const payload = {
      account,
      product_id,
      custom_bill_amount: '',
      province: '',
      configurable: true
    }

    const API_BASE_URL = process.env.API_BASE_URL
    const API_GET_BILL_PATH = process.env.API_GET_BILL_PATH
    const API_COOKIE = process.env.API_COOKIE
    const API_CSRF_TOKEN = process.env.API_CSRF_TOKEN

    if (!API_BASE_URL || !API_GET_BILL_PATH || !API_COOKIE || !API_CSRF_TOKEN) {
      return NextResponse.json(
        { error: 'Thiếu cấu hình API Gateway 1' },
        { status: 500 }
      )
    }

    const url = new URL(API_GET_BILL_PATH, API_BASE_URL).toString()
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'a-csrftoken': API_CSRF_TOKEN,
        'a-from': 'APC-js',
        'a-lang': 'vi',
        'a-os': 'web',
        'a-timestamp': nowSec(),
        'Cookie': API_COOKIE,
        'Origin': API_BASE_URL,
        'Referer': `${API_BASE_URL}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify(payload)
    })

    const contentType = response.headers.get('content-type') || ''
    const responseText = await response.text()

    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { 
          error: 'Lỗi từ API Gateway 1',
          details: responseText || 'Phản hồi không phải JSON'
        },
        { status: response.status }
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'API Gateway 1 trả về JSON không hợp lệ',
          details: 'Lỗi parse JSON'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Error in /api/get-bill:', error)
    
    if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Gateway Timeout (API Gateway 1 không phản hồi)' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Lỗi không xác định' },
      { status: 500 }
    )
  }
}