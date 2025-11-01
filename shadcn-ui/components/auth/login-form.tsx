"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Loader2, LogIn } from "lucide-react"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    setIsLoading(true)
    try {
      // First, get the employee record to check credentials
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single()

      if (employeeError || !employee) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng')
      }

      // Sign in with Supabase Auth using email (we'll use username@company.local format)
      const email = `${username}@company.local`
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng')
      }

      // Update session metadata with employee info
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          employee_id: employee.id,
          username: employee.username,
          role: employee.role,
          full_name: employee.full_name,
        }
      })

      if (updateError) {
        console.warn('Could not update user metadata:', updateError)
      }

      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${employee.full_name || employee.username}!`,
      })

      router.push('/dashboard')
    } catch (error: any) {
      toast({
        title: "Lỗi đăng nhập",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" />
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-center">
            Hệ thống tra cứu hóa đơn điện
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-sm">
                Ghi nhớ đăng nhập
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Admin mặc định: admin / 123456
          </p>
        </CardContent>
      </Card>
    </div>
  )
}