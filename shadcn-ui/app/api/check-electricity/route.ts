import { NextRequest, NextResponse } from 'next/server'

const NEW_API_BASE_URL = process.env.NEW_API_BASE_URL || 'https://bill.7ty.vn'
const NEW_API_PATH = process.env.NEW_API_PATH || '/api/check-electricity'

export async function POST(request: NextRequest) {
  try {
    const { contract_number, sku } = await request.json()

    if (!contract_number || !sku) {
      return NextResponse.json(
        { error: 'Thiếu contract_number hoặc sku' },
        { status: 400 }
      )
    }

    const payload = {
      contract_number,
      sku
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const upstream = await fetch(new URL(NEW_API_PATH, NEW_API_BASE_URL).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
            error: 'Lỗi từ API Cổng 2 (7ty.vn)', 
            details: responseText || 'Phản hồi không phải JSON' 
          },
          { status: upstream.status }
        )
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseErr) {
        console.error('Lỗi parse JSON Cổng 2:', parseErr, 'Response text:', responseText)
        return NextResponse.json(
          { 
            error: 'API Cổng 2 trả về JSON không hợp lệ (có thể là rỗng)', 
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
    console.error('Error in /api/check-electricity:', error)
    
    if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Gateway Timeout (API Cổng 2 không phản hồi)' },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}