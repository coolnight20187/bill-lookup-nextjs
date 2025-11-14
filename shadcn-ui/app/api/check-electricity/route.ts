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

export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json(
      { error: 'Chưa đăng nhập' },
      { status: 401 }
    )
  }

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

    const NEW_API_BASE_URL = process.env.NEW_API_BASE_URL
    const NEW_API_PATH = process.env.NEW_API_PATH

    if (!NEW_API_BASE_URL || !NEW_API_PATH) {
      return NextResponse.json(
        { error: 'Thiếu cấu hình API Gateway 2' },
        { status: 500 }
      )
    }

    const url = new URL(NEW_API_PATH, NEW_API_BASE_URL).toString()
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const contentType = response.headers.get('content-type') || ''
    const responseText = await response.text()

    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        {
          error: 'Lỗi từ API Gateway 2 (7ty.vn)',
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
          error: 'API Gateway 2 trả về JSON không hợp lệ',
          details: 'Lỗi parse JSON'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Error in /api/check-electricity:', error)
    
    if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { error: 'Gateway Timeout (API Gateway 2 không phản hồi)' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Lỗi không xác định' },
      { status: 500 }
    )
  }
}