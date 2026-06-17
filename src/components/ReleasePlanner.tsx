'use client'
// src/components/ReleasePlanner.tsx

import { useState, useEffect, useCallback } from 'react'
import { Plus, CheckSquare, Square, Trash2, ChevronDown, Music, Calendar } from 'lucide-react'

type ReleaseType   = 'SINGLE' | 'EP' | 'ALBUM' | 'MIXTAPE' | 'OTHER'
type ReleaseStatus = 'IDEA' | 'IN_PROGRESS' | 'READY' | 'RELEASED'

interface ReleaseTask { id: string; title: string; done: boolean; dueDate?: string; order: number }
interface Release {
  id: string; title: string; type: ReleaseType; status: ReleaseStatus
  releaseDate?: string; notes?: string; tasks: ReleaseTask[]
}

const STATUS_CFG: Record<ReleaseStatus, { label: string; cls: string }> = {
  IDEA:        { label: 'Idea',        cls: 'bg-zinc-700 text-zinc-300' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-900 text-blue-300' },
  READY:       { label: 'Ready',       cls: 'bg-yellow-900 text-yellow-300' },
  RELEASED:    { label: 'Released ✓',  cls: 'bg-green-900 text-green-300' },
}

const TYPE_LABELS: Record<ReleaseType, string> = {
  SINGLE: 'Single', EP: 'EP', ALBUM: 'Album', MIXTAPE: 'Mixtape', OTHER: 'Other',
}

const DEFAULT_TASKS = [
  'Record & mix tracks',
  'Master audio',
  'Design artwork',
  'Upload to distributor (DistroKid / TuneCore)',
  'Submit to playlists',
  'Schedule social posts',
  'Pitch to blogs & press',
]

export default function ReleasePlanner({ artistId }: { artistId: string }) {
  const [releases, setReleases]     = useState<Release[]>([])
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({})
  const [loading, setLoading]       = useState(true)
  const [form, setForm] = useState({
    title: '', type: 'SINGLE' as ReleaseType,
    status: 'IDEA' as ReleaseStatus, releaseDate: '', notes: '',
  })

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/releases?artistId=${artistId}`)
      if (r.ok) { const data = await r.json(); setReleases(Array.isArray(data) ? data : []) }
    } catch (e) { console.error('Releases load error', e) }
    setLoading(false)
  }, [artistId])

  useEffect(() => { load() }, [load])

  async function createRelease(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/releases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistId, ...form }),
    })
    if (r.ok) {
      const release = await r.json()
      for (let i = 0; i < DEFAULT_TASKS.length; i++) {
        await fetch(`/api/releases/${release.id}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: DEFAULT_TASKS[i], order: i }),
        })
      }
      setForm({ title: '', type: 'SINGLE', status: 'IDEA', releaseDate: '', notes: '' })
      setShowForm(false)
      setExpanded(release.id)
      load()
    }
  }

  async function updateStatus(id: string, status: ReleaseStatus) {
    await fetch(`/api/releases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function addTask(releaseId: string) {
    const title = taskInputs[releaseId]?.trim()
    if (!title) return
    await fetch(`/api/releases/${releaseId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    setTaskInputs(p => ({ ...p, [releaseId]: '' }))
    load()
  }

  async function toggleTask(releaseId: string, taskId: string, done: boolean) {
    await fetch(`/api/releases/${releaseId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !done }),
    })
    load()
  }

  async function delTask(releaseId: string, taskId: string) {
    await fetch(`/api/releases/${releaseId}/tasks/${taskId}`, { method: 'DELETE' })
    load()
  }

  async function delRelease(id: string) {
    if (!confirm('Delete this release and all its tasks?')) return
    await fetch(`/api/releases/${id}`, { method: 'DELETE' })
    load()
  }

  function daysUntil(date?: string) {
    if (!date) return null
    return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
  }

  function progress(tasks: ReleaseTask[]) {
    if (!tasks.length) return 0
    return Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)
  }

  return (
    <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Music size={18} className="text-pink-400" /> Release Planner
          </h2>
          <p className="text-zinc-400 text-xs mt-0.5">Plan and track every step of your releases</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#6c5ce7] to-pink-500 hover:opacity-90 text-white text-sm px-3 py-1.5 rounded-lg">
          <Plus size={14} /> New Release
        </button>
      </div>

      {showForm && (
        <form onSubmit={createRelease} className="mb-5 bg-zinc-900 rounded-xl p-4 space-y-3">
          <input required placeholder="Release title *" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ReleaseType }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500">
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input type="date" value={form.releaseDate}
              onChange={e => setForm(f => ({ ...f, releaseDate: e.target.value }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <textarea placeholder="Notes (optional)" value={form.notes} rows={2}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
          <p className="text-zinc-600 text-xs">A default checklist of {DEFAULT_TASKS.length} tasks will be added automatically.</p>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-zinc-400 text-sm px-3 py-1.5 hover:text-white">Cancel</button>
            <button type="submit" className="bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white text-sm px-4 py-1.5 rounded-lg">Create</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-zinc-500 text-sm">Loading…</p>
        : releases.length === 0 ? (
          <div className="text-center py-10">
            <Music size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No releases yet — plan your first drop.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {releases.map(release => {
              const open = expanded === release.id
              const pct  = progress(release.tasks)
              const days = daysUntil(release.releaseDate)
              const cfg  = STATUS_CFG[release.status]
              const done = release.tasks.filter(t => t.done).length
              return (
                <div key={release.id} className="bg-zinc-900 rounded-xl overflow-hidden">
                  <button onClick={() => setExpanded(open ? null : release.id)} className="w-full p-4 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold">{release.title}</span>
                        <span className="text-zinc-500 text-xs">{TYPE_LABELS[release.type]}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-xs">{done}/{release.tasks.length}</span>
                        <ChevronDown size={13} className={`text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#6c5ce7] to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                    {release.releaseDate && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Calendar size={11} className="text-zinc-600" />
                        <span className={`text-xs ${days !== null && days < 0 ? 'text-red-400' : days !== null && days <= 14 ? 'text-yellow-400' : 'text-zinc-500'}`}>
                          {new Date(release.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {days !== null && days >= 0 && ` · ${days}d away`}
                          {days !== null && days < 0 && ` · Released`}
                        </span>
                      </div>
                    )}
                  </button>

                  {open && (
                    <div className="border-t border-zinc-800 px-4 pb-4 pt-3 space-y-2">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-zinc-500 text-xs self-center">Stage:</span>
                        {(Object.keys(STATUS_CFG) as ReleaseStatus[]).map(s => (
                          <button key={s} onClick={() => updateStatus(release.id, s)}
                            className={`text-xs px-2 py-0.5 rounded-full transition-opacity ${STATUS_CFG[s].cls} ${release.status === s ? 'opacity-100 ring-1 ring-white/20' : 'opacity-40 hover:opacity-80'}`}>
                            {STATUS_CFG[s].label}
                          </button>
                        ))}
                      </div>

                      {release.tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 group py-0.5">
                          <button onClick={() => toggleTask(release.id, task.id, task.done)}
                            className="flex-shrink-0 text-zinc-500 hover:text-indigo-400 transition-colors">
                            {task.done ? <CheckSquare size={15} className="text-indigo-400" /> : <Square size={15} />}
                          </button>
                          <span className={`text-sm flex-1 ${task.done ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>
                            {task.title}
                          </span>
                          <button onClick={() => delTask(release.id, task.id)}
                            className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}

                      <div className="flex gap-2 mt-2">
                        <input placeholder="Add a task…"
                          value={taskInputs[release.id] ?? ''}
                          onChange={e => setTaskInputs(p => ({ ...p, [release.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTask(release.id))}
                          className="flex-1 bg-zinc-800 text-white text-xs rounded-lg px-3 py-1.5 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
                        <button onClick={() => addTask(release.id)} className="text-indigo-400 hover:text-indigo-300 text-xs px-2">Add</button>
                      </div>

                      {release.notes && <p className="text-zinc-600 text-xs mt-2 italic">{release.notes}</p>}

                      <div className="flex justify-end mt-2">
                        <button onClick={() => delRelease(release.id)}
                          className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs">
                          <Trash2 size={11} /> Delete release
                        </button>
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
