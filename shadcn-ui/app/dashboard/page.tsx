'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export const dynamic = 'force-dynamic'

interface User {
  id: number
  username: string
  role: 'admin' | 'user'
  full_name?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Session check error:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return <DashboardClient user={user} onLogout={handleLogout} />
}