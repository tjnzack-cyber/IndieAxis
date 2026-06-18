'use client'
// src/components/RevenueTracker.tsx

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, DollarSign, TrendingUp } from 'lucide-react'

type RevenueType = 'STREAMING' | 'GIG' | 'SYNC' | 'MERCHANDISE' | 'ROYALTY' | 'GRANT' | 'OTHER'

interface RevenueEntry {
  id: string
  type: RevenueType
  amount: number
  currency: string
  description?: string
  source?: string
  date: string
}

const TYPE_CONFIG: Record<RevenueType, { label: string; color: string; bg: string }> = {
  STREAMING:   { label: 'Streaming',   color: 'text-green-400',  bg: 'bg-green-900/40'  },
  GIG:         { label: 'Gig',         color: 'text-blue-400',   bg: 'bg-blue-900/40'   },
  SYNC:        { label: 'Sync',        color: 'text-yellow-400', bg: 'bg-yellow-900/40' },
  MERCHANDISE: { label: 'Merch',       color: 'text-pink-400',   bg: 'bg-pink-900/40'   },
  ROYALTY:     { label: 'Royalty',     color: 'text-purple-400', bg: 'bg-purple-900/40' },
  GRANT:       { label: 'Grant',       color: 'text-cyan-400',   bg: 'bg-cyan-900/40'   },
  OTHER:       { label: 'Other',       color: 'text-zinc-400',   bg: 'bg-zinc-800'      },
}

const CURRENCIES = ['USD', 'GBP', 'EUR', 'ZMW', 'NGN', 'GHS', 'KES', 'ZAR']

const BLANK = {
  type: 'GIG' as RevenueType, amount: '', currency: 'USD',
  description: '', source: '', date: new Date().toISOString().split('T')[0],
}

export default function RevenueTracker({ artistId }: { artistId: string }) {
  const [entries, setEntries]   = useState<RevenueEntry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(BLANK)
  const [loading, setLoading]   = useState(true)
  const [filterType, setFilter] = useState<RevenueType | 'ALL'>('ALL')

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/revenue?artistId=${artistId}`)
      if (r.ok) { const data = await r.json(); setEntries(Array.isArray(data) ? data : []) }
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [artistId])

  useEffect(() => { load() }, [load])

  async function addEntry(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/revenue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistId, ...form }),
    })
    if (r.ok) { setForm(BLANK); setShowForm(false); load() }
  }

  async function deleteEntry(id: string) {
    await fetch(`/api/revenue/${id}`, { method: 'DELETE' })
    load()
  }

  // Totals by type
  const totals = entries.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const grandTotal = entries.reduce((sum, e) => sum + e.amount, 0)

  const filtered = filterType === 'ALL' ? entries : entries.filter(e => e.type === filterType)

  function fmt(amount: number, currency = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="md:col-span-4 bg-gradient-to-r from-[#6c5ce7] to-pink-500 rounded-xl p-4 text-white">
          <p className="text-xs uppercase tracking-wider opacity-80 mb-1">Total Revenue</p>
          <p className="text-3xl font-black">{fmt(grandTotal)}</p>
          <p className="text-xs opacity-60 mt-1">{entries.length} entries</p>
        </div>
        {Object.entries(totals).map(([type, total]) => {
          const cfg = TYPE_CONFIG[type as RevenueType]
          return (
            <div key={type} className={`${cfg.bg} rounded-xl p-3 border border-white/5`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${cfg.color} mb-1`}>{cfg.label}</p>
              <p className="text-white font-bold text-lg">{fmt(total)}</p>
            </div>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('ALL')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterType === 'ALL' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}>
            All
          </button>
          {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
            <button key={type} onClick={() => setFilter(type as RevenueType)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterType === type ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}>
              {cfg.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#6c5ce7] to-pink-500 hover:opacity-90 text-white text-sm px-3 py-1.5 rounded-lg">
          <Plus size={14} /> Log Income
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={addEntry} className="bg-zinc-900 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as RevenueType }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500">
              {Object.entries(TYPE_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </select>
            <div className="flex gap-2">
              <input required type="number" step="0.01" min="0" placeholder="Amount *"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="flex-1 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
              <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                className="bg-zinc-800 text-white text-sm rounded-lg px-2 py-2 outline-none focus:ring-1 focus:ring-indigo-500">
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <input placeholder="Source (e.g. Spotify, Venue name)"
              value={form.source}
              onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
            <input type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500" />
            <input placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="col-span-2 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-zinc-400 text-sm px-3 py-1.5 hover:text-white">Cancel</button>
            <button type="submit" className="bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white text-sm px-4 py-1.5 rounded-lg">Save</button>
          </div>
        </form>
      )}

      {/* Entries list */}
      {loading ? <p className="text-zinc-500 text-sm">Loading…</p>
        : filtered.length === 0 ? (
          <div className="text-center py-10">
            <DollarSign size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No income logged yet — click Log Income to start.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(entry => {
              const cfg = TYPE_CONFIG[entry.type]
              return (
                <div key={entry.id} className="bg-zinc-800/50 dark:bg-zinc-900 rounded-xl px-4 py-3 flex items-center gap-3 border border-zinc-200 dark:border-transparent group">
                  <div className={`${cfg.bg} p-2 rounded-lg flex-shrink-0`}>
                    <TrendingUp size={14} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase ${cfg.color}`}>{cfg.label}</span>
                      {entry.source && <span className="text-zinc-500 text-xs">· {entry.source}</span>}
                    </div>
                    {entry.description && <p className="text-zinc-400 dark:text-zinc-500 text-xs truncate">{entry.description}</p>}
                    <p className="text-zinc-500 text-xs">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white dark:text-white text-zinc-900 font-bold">{fmt(entry.amount, entry.currency)}</p>
                  </div>
                  <button onClick={() => deleteEntry(entry.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all ml-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
