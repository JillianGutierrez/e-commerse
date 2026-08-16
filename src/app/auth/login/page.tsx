'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (res?.ok) {
        const sessionRes = await fetch('/api/auth/session')
        if (sessionRes.ok) {
          const session = await sessionRes.json()
          const role = session?.user?.role
          if (role === 'ADMIN') router.push('/admin')
          else if (role === 'SELLER') router.push('/seller')
          else if (role === 'COURIER') router.push('/courier')
          else router.push('/buyer')
        } else {
          router.push('/')
        }
        router.refresh()
      } else {
        toast.error('Invalid email or password')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-[#D4AF37]" />
            <span className="text-2xl font-semibold tracking-tight">Shopora</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-neutral-500 mt-2">Sign in to your account to continue</p>
        </div>

        <Card className="border-0 shadow-lg shadow-black/5 rounded-2xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl border-neutral-200 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl border-neutral-200 h-12"
                />
              </div>
              <Button type="submit" className="w-full rounded-xl h-12 bg-black text-white hover:bg-neutral-800" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-neutral-500">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full rounded-xl h-12 border-neutral-200 hover:bg-neutral-50"
              onClick={handleGoogleSignIn}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Google
            </Button>

            <p className="text-center text-sm text-neutral-500 mt-8">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-black font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
