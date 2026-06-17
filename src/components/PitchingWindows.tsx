'use client'
// src/components/PitchingWindows.tsx

import { useState, useEffect, useCallback } from 'react'
import { Bell, Calendar, MapPin, Tag, ChevronDown, ExternalLink, Plus, Trash2 } from 'lucide-react'

interface PitchingWindow {
  id: string
  title: string
  description?: string
  month: string
  location?: string
  deadline?: string
  category?: string
}

const CATEGORIES = ['All', 'Festival', 'Playlist', 'Radio', 'Label', 'Sync', 'Blog', 'Other']

const CATEGORY_COLORS: Record<string, string> = {
  Festival: 'bg-pink-900/60 text-pink-300 border-pink-800',
  Playlist:  'bg-green-900/60 text-green-300 border-green-800',
  Radio:     'bg-blue-900/60 text-blue-300 border-blue-800',
  Label:     'bg-purple-900/60 text-purple-300 border-purple-800',
  Sync:      'bg-yellow-900/60 text-yellow-300 border-yellow-800',
  Blog:      'bg-orange-900/60 text-orange-300 border-orange-800',
  Other:     'bg-zinc-800 text-zinc-300 border-zinc-700',
}

// Seeded pitching windows — real opportunities artists can act on
const SEED_WINDOWS: Omit<PitchingWindow, "id">[] = [
  { title: "BBC Introducing Uploads", category: "Radio", month: "Ongoing", deadline: "Rolling", description: "Upload tracks to BBC Introducing for regional radio play and festival slots.", location: "UK" },
  { title: "SubmitHub Playlist Pitching", category: "Playlist", month: "Ongoing", deadline: "Rolling", description: "Pitch to independent playlist curators across Spotify, Apple Music and YouTube.", location: "Global" },
  { title: "Spotify for Artists Editorial", category: "Playlist", month: "Ongoing", deadline: "7 days before release", description: "Submit unreleased tracks for editorial playlist consideration via Spotify for Artists.", location: "Global" },
  { title: "SXSW 2027 Artist Applications", category: "Festival", month: "Aug 2026", deadline: "Sep 2026", description: "Apply to perform at SXSW, one of the biggest music discovery festivals in the world.", location: "Austin, TX" },
  { title: "The Great Escape 2027", category: "Festival", month: "Oct 2026", deadline: "Nov 2026", description: "UK showcase festival for emerging artists. Strong industry attendance.", location: "Brighton, UK" },
  { title: "Sync Licensing via Music Vine", category: "Sync", month: "Ongoing", deadline: "Rolling", description: "Submit music for TV, film and ad placements via Music Vine open submission.", location: "Global" },
  { title: "AWAL Open Submissions", category: "Label", month: "Ongoing", deadline: "Rolling", description: "AWAL accepts direct artist applications for distribution and label services.", location: "Global" },
  { title: "Africa Rising on Audiomack", category: "Playlist", month: "Jul 2026", deadline: "Jul 31 2026", description: "Audiomack editorial playlist spotlighting African artists across genres.", location: "Africa / Global" },
  { title: "Notion Magazine Fresh Picks", category: "Blog", month: "Ongoing", deadline: "Rolling", description: "Submit music to Notion for editorial coverage and playlist features.", location: "UK / Global" },
  { title: "Afropunk Festival 2027", category: "Festival", month: "Sep 2026", deadline: "Oct 2026", description: "Apply to perform at Afropunk, celebrating Black creativity across music and culture.", location: "Brooklyn / Global" },
]

export default function PitchingWindows({ artistGenre }: { artistGenre?: string }) {
  const [windows, setWindows]     = useState<PitchingWindow[]>([])
  const [filter, setFilter]       = useState('All')
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [form, setForm] = useState({ title: '', category: 'Other', month: '', deadline: '', location: '', description: '' })

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/pitching-windows')
      if (r.ok) {
        const data = await r.json()
        if (Array.isArray(data) && data.length > 0) {
          setWindows(data)
        } else {
          // Seed with defaults if empty
          setWindows(SEED_WINDOWS.map((w, i) => ({ ...w, id: `seed-${i}` })))
        }
      }
    } catch (e) {
      setWindows(SEED_WINDOWS.map((w, i) => ({ ...w, id: `seed-${i}` })))
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function addWindow(e: React.FormEvent) {
    e.preventDefault()
    try {
      const r = await fetch('/api/pitching-windows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (r.ok) {
        setForm({ title: '', category: 'Other', month: '', deadline: '', location: '', description: '' })
        setShowAdd(false)
        load()
      }
    } catch (e) { console.error(e) }
  }

  async function deleteWindow(id: string) {
    if (id.startsWith('seed-')) return // can't delete seed items
    await fetch(`/api/pitching-windows/${id}`, { method: 'DELETE' })
    load()
  }

  const filtered = filter === 'All' ? windows : windows.filter(w => w.category === filter)

  function daysUntil(deadline?: string) {
    if (!deadline || deadline === 'Rolling') return null
    const d = new Date(deadline)
    if (isNaN(d.getTime())) return null
    return Math.ceil((d.getTime() - Date.now()) / 86400000)
  }

  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-zinc-900 dark:text-white font-bold text-lg flex items-center gap-2">
            <Bell size={18} className="text-yellow-400" /> Pitching Windows
          </h2>
          <p className="text-zinc-400 text-xs mt-0.5">Open submission windows for playlists, festivals, radio & more</p>
        </div>
        <button onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={addWindow} className="mb-5 bg-zinc-900 rounded-xl p-4 space-y-3">
          <input required placeholder="Title *" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500">
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Month (e.g. Aug 2026)" value={form.month}
              onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
            <input placeholder="Deadline" value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
            <input placeholder="Location" value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <textarea placeholder="Description" value={form.description} rows={2}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowAdd(false)} className="text-zinc-400 text-sm px-3 py-1.5 hover:text-white">Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1.5 rounded-lg">Save</button>
          </div>
        </form>
      )}

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filter === c
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
            }`}>
            {c}
          </button>
        ))}
      </div>

      {loading ? <p className="text-zinc-500 text-sm">Loading…</p>
        : filtered.length === 0 ? <p className="text-zinc-500 text-sm text-center py-6">No windows in this category.</p>
        : (
          <div className="space-y-2">
            {filtered.map(w => {
              const open = expanded === w.id
              const days = daysUntil(w.deadline)
              const catColor = CATEGORY_COLORS[w.category ?? 'Other'] ?? CATEGORY_COLORS.Other
              return (
                <div key={w.id} className="bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-transparent">
                  <button onClick={() => setExpanded(open ? null : w.id)} className="w-full p-4 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-zinc-900 dark:text-white text-sm font-semibold">{w.title}</span>
                          {w.category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${catColor}`}>
                              {w.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronDown size={13} className={`text-zinc-500 flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      {w.month && (
                        <span className="flex items-center gap-1 text-zinc-500 text-xs">
                          <Calendar size={11} /> {w.month}
                        </span>
                      )}
                      {w.location && (
                        <span className="flex items-center gap-1 text-zinc-500 text-xs">
                          <MapPin size={11} /> {w.location}
                        </span>
                      )}
                      {w.deadline && (
                        <span className={`flex items-center gap-1 text-xs font-medium ${
                          days !== null && days <= 14 ? 'text-yellow-400' :
                          days !== null && days < 0  ? 'text-red-400' : 'text-zinc-400'
                        }`}>
                          <Tag size={11} />
                          Deadline: {w.deadline}
                          {days !== null && days >= 0 && ` · ${days}d left`}
                          {days !== null && days < 0 && ' · Closed'}
                        </span>
                      )}
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-zinc-800 px-4 pb-4 pt-3">
                      {w.description && <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3">{w.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-600 text-xs">
                          {w.deadline === 'Rolling' || !w.deadline ? '🟢 Always open' : ''}
                        </span>
                        <div className="flex items-center gap-3">
                          {!w.id.startsWith('seed-') && (
                            <button onClick={() => deleteWindow(w.id)}
                              className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs">
                              <Trash2 size={11} /> Remove
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const query = encodeURIComponent(w.title)
                              window.open(`https://www.google.com/search?q=${query}`, '_blank')
                            }}
                            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs">
                            Find submission <ExternalLink size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
