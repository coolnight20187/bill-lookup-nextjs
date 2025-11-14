'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export const dynamic = 'force-dynamic'

interface User {
  id: number
  username: string
  role: 'admin' | 'user'
  full_name?: string
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Session check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (userData: User) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
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
    return <LoginForm onLogin={handleLogin} />
  }

  return <DashboardClient user={user} onLogout={handleLogout} />
}