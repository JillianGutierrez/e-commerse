'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Sparkles, Eye, EyeOff } from 'lucide-react'

// Role-to-portal mapping
const ROLE_PORTALS: Record<string, string> = {
  ADMIN: '/admin',
  SELLER: '/seller',
  COURIER: '/courier',
  BUYER: '/buyer',
}

// The portal prefixes we allow as callbackUrl destinations
const ALLOWED_PORTALS = ['/admin', '/seller', '/courier', '/buyer']

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  /**
   * Returns the destination after login:
   * - If callbackUrl points to a portal the user's role can access, use it.
   * - Otherwise fall back to the role's default portal.
   */
  function resolveRedirect(role: string): string {
    const defaultPortal = ROLE_PORTALS[role] ?? '/'

    if (!callbackUrl) return defaultPortal

    // Only honour same-origin paths that start with an allowed portal prefix
    const isAllowed = ALLOWED_PORTALS.some(
      (p) => callbackUrl === p || callbackUrl.startsWith(p + '/')
    )
    if (!isAllowed) return defaultPortal

    // Make sure the callbackUrl portal matches the user's role
    const callbackPortal = ALLOWED_PORTALS.find(
      (p) => callbackUrl === p || callbackUrl.startsWith(p + '/')
    )
    if (callbackPortal && callbackPortal === defaultPortal) {
      return callbackUrl
    }

    // Role mismatch — send them to their own portal instead
    return defaultPortal
  }

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
          const role: string = session?.user?.role ?? ''
          router.push(resolveRedirect(role))
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
      // Preserve the callbackUrl for Google sign-in too
      await signIn('google', { callbackUrl: callbackUrl || '/' })
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
            <Image src="/ZAYLO_LOGO_DARK.png" alt="ZAYLO" width={100} height={36} />
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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl border-neutral-200 h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl h-12 bg-black text-white hover:bg-neutral-800"
                disabled={loading}
              >
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

// useSearchParams must be wrapped in Suspense
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
