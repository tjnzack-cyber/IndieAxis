'use client'
// src/components/AnalyticsDashboard.tsx

import { useState, useEffect, useCallback } from 'react'
import { Plus, TrendingUp, BarChart3, Music, DollarSign, Trash2, RefreshCw, Sparkles } from 'lucide-react'

interface StatSnapshot {
  id: string
  date: string
  spotifyListeners?: number
  instagramFollowers?: number
  tiktokFollowers?: number
  youtubeSubscribers?: number
  soundcloudPlays?: number
}

interface RevenueEntry {
  id: string
  type: string
  amount: number
  currency: string
  date: string
}

interface Release {
  id: string
  title: string
  type: string
  status: string
  releaseDate?: string
  tasks: { done: boolean }[]
}

const STAT_FIELDS = [
  { key: 'spotifyListeners',   label: 'Spotify Listeners',   color: '#1db954' },
  { key: 'instagramFollowers', label: 'Instagram Followers', color: '#e1306c' },
  { key: 'tiktokFollowers',    label: 'TikTok Followers',    color: '#69c9d0' },
  { key: 'youtubeSubscribers', label: 'YouTube Subscribers', color: '#ff0000' },
  { key: 'soundcloudPlays',    label: 'SoundCloud Plays',    color: '#ff5500' },
]

const REVENUE_COLORS: Record<string, string> = {
  STREAMING: '#1db954', GIG: '#3b82f6', SYNC: '#f59e0b',
  MERCHANDISE: '#ec4899', ROYALTY: '#8b5cf6', GRANT: '#06b6d4', OTHER: '#6b7280',
}

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function MiniLineChart({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <span className="text-zinc-600 text-xs">Not enough data</span>
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 120; const h = 40; const pad = 4
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  const last = points.split(' ').pop()!.split(',')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  )
}

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  if (!data.length) return <p className="text-zinc-600 text-xs">No data yet</p>
  const max = Math.max(...data.map(d => d.value))
  return (
    <div className="space-y-2">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-zinc-400 text-xs w-24 flex-shrink-0">{d.label}</span>
          <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }} />
          </div>
          <span className="text-white text-xs font-bold w-16 text-right">${d.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

const BLANK = {
  spotifyListeners: '', instagramFollowers: '', tiktokFollowers: '',
  youtubeSubscribers: '', soundcloudPlays: '', date: new Date().toISOString().split('T')[0],
}

export default function AnalyticsDashboard({
  artistId, artistName, artistLocation,
}: {
  artistId: string
  artistName: string
  artistLocation?: string
}) {
  const [snapshots, setSnapshots] = useState<StatSnapshot[]>([])
  const [revenue, setRevenue]     = useState<RevenueEntry[]>([])
  const [releases, setReleases]   = useState<Release[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(BLANK)
  const [fetching, setFetching]   = useState(false)
  const [fetchMsg, setFetchMsg]   = useState('')

  const load = useCallback(async () => {
    try {
      const [snapRes, revRes, relRes] = await Promise.all([
        fetch(`/api/stats?artistId=${artistId}`),
        fetch(`/api/revenue?artistId=${artistId}`),
        fetch(`/api/releases?artistId=${artistId}`),
      ])
      if (snapRes.ok) { const d = await snapRes.json(); setSnapshots(Array.isArray(d) ? d : []) }
      if (revRes.ok)  { const d = await revRes.json();  setRevenue(Array.isArray(d) ? d : []) }
      if (relRes.ok)  { const d = await relRes.json();  setReleases(Array.isArray(d) ? d : []) }
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [artistId])

  useEffect(() => { load() }, [load])

  // Auto-fetch stats from Groq and pre-fill the form
  async function autoFetch() {
    setFetching(true)
    setFetchMsg('Searching for your stats…')
    setShowForm(true)
    try {
      const r = await fetch('/api/artist-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName, location: artistLocation }),
      })
      if (r.ok) {
        const data = await r.json()
        if (data.found) {
          setForm({
            spotifyListeners:   data.spotifyListeners   ? String(data.spotifyListeners)   : '',
            instagramFollowers: data.instagramFollowers ? String(data.instagramFollowers) : '',
            tiktokFollowers:    data.tiktokFollowers    ? String(data.tiktokFollowers)    : '',
            youtubeSubscribers: data.youtubeSubscribers ? String(data.youtubeSubscribers) : '',
            soundcloudPlays:    data.soundcloudPlays    ? String(data.soundcloudPlays)    : '',
            date: new Date().toISOString().split('T')[0],
          })
          setFetchMsg(data.verified
            ? '✓ Stats found — review and save'
            : '⚠ Estimated stats — verify before saving')
        } else {
          setFetchMsg('No stats found — enter manually below')
        }
      }
    } catch (e) {
      setFetchMsg('Could not fetch stats — enter manually')
    }
    setFetching(false)
  }

  async function logSnapshot(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistId, ...form }),
    })
    if (r.ok) { setForm(BLANK); setShowForm(false); setFetchMsg(''); load() }
  }

  async function deleteSnapshot(id: string) {
    await fetch(`/api/stats/${id}`, { method: 'DELETE' })
    load()
  }

  const latest = snapshots[snapshots.length - 1]
  const prev   = snapshots[snapshots.length - 2]

  function growth(key: string) {
    if (!latest || !prev) return null
    const l = (latest as any)[key]
    const p = (prev as any)[key]
    if (!l || !p) return null
    return Math.round(((l - p) / p) * 100)
  }

  const revByType = revenue.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const revChartData = Object.entries(revByType)
    .map(([type, value]) => ({
      label: type.charAt(0) + type.slice(1).toLowerCase(),
      value, color: REVENUE_COLORS[type] ?? '#6b7280',
    }))
    .sort((a, b) => b.value - a.value)

  const totalRevenue = revenue.reduce((s, e) => s + e.amount, 0)

  const releaseProgress = releases.map(r => ({
    ...r,
    pct: r.tasks.length ? Math.round((r.tasks.filter(t => t.done).length / r.tasks.length) * 100) : 0,
  }))

  if (loading) return <div className="text-zinc-500 text-sm p-6">Loading analytics…</div>

  return (
    <div className="space-y-6">

      {/* Stat snapshot cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {STAT_FIELDS.map(field => {
          const val = latest ? (latest as any)[field.key] : null
          const g = growth(field.key)
          const chartData = snapshots
            .map(s => (s as any)[field.key])
            .filter((v): v is number => v !== null && v !== undefined)

          return (
            <div key={field.key} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <p className="text-zinc-500 text-xs mb-1">{field.label}</p>
              <p className="text-white font-black text-xl">{val ? fmt(val) : '—'}</p>
              {g !== null && (
                <p className={`text-xs font-bold mt-0.5 ${g >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {g >= 0 ? '▲' : '▼'} {Math.abs(g)}% vs last log
                </p>
              )}
              {chartData.length >= 2 && (
                <div className="mt-2">
                  <MiniLineChart data={chartData} color={field.color} />
                </div>
              )}
            </div>
          )
        })}

        {/* Auto-fetch + manual log button */}
        <div className="bg-zinc-900 rounded-xl p-4 border border-dashed border-zinc-700 flex flex-col items-center justify-center gap-3">
          <button onClick={autoFetch} disabled={fetching}
            className="flex items-center gap-2 bg-gradient-to-r from-[#6c5ce7] to-pink-500 hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-lg w-full justify-center transition-all">
            {fetching
              ? <><RefreshCw size={13} className="animate-spin" /> Fetching…</>
              : <><Sparkles size={13} /> Auto-fetch Stats</>}
          </button>
          <button onClick={() => { setShowForm(v => !v); setFetchMsg('') }}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs w-full justify-center transition-colors">
            <Plus size={12} /> Enter manually
          </button>
        </div>
      </div>

      {/* Log form */}
      {showForm && (
        <form onSubmit={logSnapshot} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white text-sm font-bold">Log Stat Snapshot</h3>
              {fetchMsg && (
                <p className={`text-xs mt-0.5 ${fetchMsg.startsWith('✓') ? 'text-green-400' : fetchMsg.startsWith('⚠') ? 'text-yellow-400' : 'text-zinc-500'}`}>
                  {fetchMsg}
                </p>
              )}
            </div>
            <input type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="bg-zinc-800 text-white text-xs rounded-lg px-2 py-1 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {STAT_FIELDS.map(field => (
              <div key={field.key}>
                <label className="text-xs mb-1 block" style={{ color: field.color }}>{field.label}</label>
                <input
                  type="number" min="0"
                  placeholder="0"
                  value={(form as any)[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowForm(false); setFetchMsg('') }}
              className="text-zinc-400 text-sm px-3 py-1.5 hover:text-white">Cancel</button>
            <button type="submit"
              className="bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white text-sm px-4 py-1.5 rounded-lg">
              Save Snapshot
            </button>
          </div>
        </form>
      )}

      {/* Snapshot history */}
      {snapshots.length > 0 && (
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-bold flex items-center gap-2">
              <TrendingUp size={15} className="text-indigo-400" /> Snapshot History
            </h3>
            <span className="text-zinc-600 text-xs">{snapshots.length} entries</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[...snapshots].reverse().map(snap => (
              <div key={snap.id} className="flex items-center justify-between group">
                <span className="text-zinc-500 text-xs">
                  {new Date(snap.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  {STAT_FIELDS.map(f => (snap as any)[f.key] ? (
                    <span key={f.key} className="text-xs" style={{ color: f.color }}>
                      {f.label.split(' ')[0]}: {fmt((snap as any)[f.key])}
                    </span>
                  ) : null)}
                  <button onClick={() => deleteSnapshot(snap.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue breakdown */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <h3 className="text-white text-sm font-bold flex items-center gap-2 mb-4">
          <DollarSign size={15} className="text-green-400" /> Revenue Breakdown
        </h3>
        {revChartData.length === 0 ? (
          <p className="text-zinc-600 text-xs">No revenue logged yet. Go to Hub → Revenue Tracker to add entries.</p>
        ) : (
          <>
            <BarChart data={revChartData} />
            <p className="text-zinc-500 text-xs mt-3 text-right">
              Total: <span className="text-white font-bold">${totalRevenue.toLocaleString()}</span>
            </p>
          </>
        )}
      </div>

      {/* Release timeline */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <h3 className="text-white text-sm font-bold flex items-center gap-2 mb-4">
          <Music size={15} className="text-pink-400" /> Release Progress
        </h3>
        {releaseProgress.length === 0 ? (
          <p className="text-zinc-600 text-xs">No releases yet. Go to Release Planner to add one.</p>
        ) : (
          <div className="space-y-3">
            {releaseProgress.map(r => (
              <div key={r.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-900 dark:text-white text-sm font-medium">{r.title}</span>
                    <span className="text-zinc-500 text-xs">{r.type}</span>
                  </div>
                  <span className="text-zinc-400 text-xs">{r.pct}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#6c5ce7] to-pink-500 rounded-full transition-all duration-700"
                    style={{ width: `${r.pct}%` }} />
                </div>
                {r.releaseDate && (
                  <p className="text-zinc-600 text-xs mt-0.5">
                    {new Date(r.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
