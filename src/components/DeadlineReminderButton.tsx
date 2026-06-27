'use client'
// src/components/DeadlineReminderButton.tsx
// Lets the artist manually trigger a deadline reminder email to themselves

import { useState } from 'react'
import { Bell, Check, Loader2 } from 'lucide-react'

export default function DeadlineReminderButton({ artistId }: { artistId: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<'sent' | 'none' | null>(null)

  async function send() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'deadline-reminder', artistId }),
      })
      const data = await res.json()
      setResult(data.sent ? 'sent' : 'none')
    } catch {
      setResult('none')
    } finally {
      setLoading(false)
      setTimeout(() => setResult(null), 4000)
    }
  }

  return (
    <button
      onClick={send}
      disabled={loading}
      className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-50 transition-all border border-zinc-700"
    >
      {loading ? (
        <><Loader2 size={14} className="animate-spin" /> Checking deadlines…</>
      ) : result === 'sent' ? (
        <><Check size={14} className="text-green-400" /> Reminder sent!</>
      ) : result === 'none' ? (
        <><Bell size={14} /> No deadlines in 14 days</>
      ) : (
        <><Bell size={14} /> Email Deadline Reminder</>
      )}
    </button>
  )
}
