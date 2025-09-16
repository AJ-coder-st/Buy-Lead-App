'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { LogIn, Mail } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      const result = await authApi.demoLogin()
      console.log('Login successful:', result)
      toast.success('Successfully logged in as demo user!')
      
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        window.location.href = '/buyers'
      }, 500)
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.error || 'Login failed')
      setIsLoading(false)
    }
  }

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    
    // Magic link functionality is commented out but UI is ready
    toast.error('Magic link authentication is not configured yet. Please use demo login.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Leads</h1>
          <p className="mt-2 text-gray-600">Sign in to manage your leads</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Demo Login */}
            <div className="space-y-4">
              <Button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Sign in as Demo User
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Quick access with pre-loaded sample data
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Magic Link Login (Commented functionality) */}
            <form onSubmit={handleMagicLinkLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Magic Link
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Magic link authentication is not configured yet
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            This is a demo application for managing buyer leads.
            <br />
            Use the demo login to explore all features.
          </p>
        </div>
      </div>
    </div>
  )
}
