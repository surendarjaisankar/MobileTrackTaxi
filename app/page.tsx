'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.replace('/dashboard')
    }
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Login failed')
      }

      localStorage.setItem('token', data.token)

      toast.success('Login successful')

      router.replace('/dashboard')
    } catch (error: any) {
      toast.error(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Card className="bg-slate-900 border-slate-800 p-8 w-96 space-y-6 shadow-xl">

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">
            Admin Login
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Taxi Management System
          </p>
        </div>

        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Signing in...' : 'Login'}
        </Button>

      </Card>
    </div>
  )
}
