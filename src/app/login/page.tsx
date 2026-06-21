'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import PageLoader from '@/components/PageLoader'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
      } else {
        setRedirecting(true)
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An error occurred during login')
      setLoading(false)
    }
  }

  if (redirecting) {
    return <PageLoader message="Welcome back — loading your dashboard…" />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-12 sm:px-6 lg:px-8 text-white">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Log in to IndieAxis
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} method="POST">
          <fieldset disabled={loading} className="space-y-6 disabled:opacity-60 transition-opacity">
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="relative block w-full rounded-t-md border-0 bg-white/5 py-1.5 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-3"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="relative block w-full rounded-b-md border-0 bg-white/5 py-1.5 text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 px-3"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Link href="/forgot-password" title="Forgot password?" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
                Forgot password?
              </Link>
            </div>
          </fieldset>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="button"
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any);
              }}
              className="group relative flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
