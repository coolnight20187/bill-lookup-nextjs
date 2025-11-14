import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'https://placeholder-api-1.com'
const API_GET_BILL_PATH = process.env.API_GET_BILL_PATH || '/api/get-bill'
const API_COOKIE = process.env.API_COOKIE || 'placeholder-cookie'
const API_CSRF_TOKEN = process.env.API_CSRF_TOKEN || 'placeholder-csrf-token'

function nowSec() {
  return Math.floor(Date.now() / 1000).toString()
}

export async function POST(request: NextRequest) {
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

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const upstream = await fetch(new URL(API_GET_BILL_PATH, API_BASE_URL).toString(), {
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const contentType = upstream.headers.get('content-type') || ''
      const responseText = await upstream.text()

      if (!contentType.includes('application/json')) {
        return NextResponse.json(
          { 
            error: 'Lỗi từ API Cổng 1 (Có thể bị chặn)', 
            details: responseText || 'Phản hồi không phải JSON' 
          },
          { status: upstream.status }
        )
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseErr) {
        console.error('Lỗi parse JSON Cổng 1:', parseErr, 'Response text:', responseText)
        return NextResponse.json(
          { 
            error: 'API Cổng 1 trả về JSON không hợp lệ (có thể là rỗng)', 
            details: (parseErr as Error).message 
          },
          { status: 500 }
        )
      }

      return NextResponse.json(data, { status: upstream.status })
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error: any) {
    console.error('Error in /api/get-bill:', error)
    
    if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Gateway Timeout (API Cổng 1 không phản hồi)' },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}