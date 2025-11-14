'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = (user: any) => {
    // Redirect to dashboard after successful login
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  )
}