'use client'
// src/components/FanSignupForm.tsx — used on the PUBLIC EPK page

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

export default function FanSignupForm({ artistId }: { artistId: string }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/fan-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId, email, name }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
    } catch {
      setError('Something went wrong — try again')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center justify-center gap-2 text-green-400 font-semibold py-3">
        <Check size={18} /> You're on the list!
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
      <input
        type="text"
        placeholder="Your name (optional)"
        value={name}
        onChange={e => setName(e.target.value)}
        className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-400 transition-colors"
      />
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-400 transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#6c5ce7] to-pink-500 hover:opacity-90 disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all flex-shrink-0"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : 'Subscribe'}
      </button>
      {error && <p className="text-red-400 text-xs sm:hidden">{error}</p>}
    </form>
  )
}
