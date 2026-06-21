'use client'
// src/components/FanSignupForm.tsx — used on the PUBLIC EPK page

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

export default function FanSignupForm({ artistId }: { artistId: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [nationality, setNationality] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [alreadyIn, setAlreadyIn] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/fan-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId, email, name, phone, nationality }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      if (data.alreadySubscribed) {
        setAlreadyIn(true)
      } else {
        setDone(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again')
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

  if (alreadyIn) {
    return (
      <div className="flex items-center justify-center gap-2 text-purple-300 font-semibold py-3">
        <Check size={18} /> You're already subscribed!
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-400 transition-colors"
        />
        <input
          type="email"
          required
          placeholder="Email *"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-400 transition-colors"
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-400 transition-colors"
        />
        <input
          type="text"
          placeholder="Nationality"
          value={nationality}
          onChange={e => setNationality(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-400 transition-colors"
        />
      </div>

      {error && <p className="text-red-400 text-xs text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#6c5ce7] to-pink-500 hover:opacity-90 disabled:opacity-60 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Subscribe'}
      </button>

      <p className="text-gray-600 text-xs text-center">
        Only your email is required — everything else is optional.
      </p>
    </form>
  )
}
