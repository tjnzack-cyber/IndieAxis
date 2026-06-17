'use client'
// src/components/OpportunityTracker.tsx

import { useState, useEffect, useCallback } from 'react'
import { Plus, ExternalLink, Trash2, ChevronDown } from 'lucide-react'

type OpportunityType = 'GRANT' | 'COMPETITION' | 'LABEL_DEAL' | 'SYNC_LICENSE' | 'RESIDENCY' | 'FESTIVAL' | 'OTHER'
type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'

interface Opportunity {
  id: string
  title: string
  organization?: string
  type: OpportunityType
  deadline?: string
  prize?: string
  applyUrl?: string
  status: ApplicationStatus
  notes?: string
}

const STATUS_CFG: Record<ApplicationStatus, { label: string; cls: string }> = {
  DRAFT:     { label: 'Draft',       cls: 'bg-gray-700 text-gray-300' },
  SUBMITTED: { label: 'Submitted',   cls: 'bg-blue-900 text-blue-300' },
  IN_REVIEW: { label: 'In Review',   cls: 'bg-yellow-900 text-yellow-300' },
  ACCEPTED:  { label: 'Accepted ✓',  cls: 'bg-green-900 text-green-300' },
  REJECTED:  { label: 'Rejected',    cls: 'bg-red-900 text-red-300' },
  WITHDRAWN: { label: 'Withdrawn',   cls: 'bg-gray-800 text-gray-500' },
}

const TYPE_LABELS: Record<OpportunityType, string> = {
  GRANT: 'Grant', COMPETITION: 'Competition', LABEL_DEAL: 'Label Deal',
  SYNC_LICENSE: 'Sync License', RESIDENCY: 'Residency', FESTIVAL: 'Festival', OTHER: 'Other',
}

const BLANK = {
  title: '', organization: '', type: 'OTHER' as OpportunityType,
  deadline: '', prize: '', applyUrl: '', status: 'DRAFT' as ApplicationStatus, notes: '',
}

export default function OpportunityTracker({ artistId }: { artistId: string }) {
  const [opps, setOpps]           = useState<Opportunity[]>([])
  const [form, setForm]           = useState(BLANK)
  const [showForm, setShowForm]   = useState(false)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [loading, setLoading]     = useState(true)

  const load = useCallback(async () => {
    const r = await fetch(`/api/opportunities?artistId=${artistId}`)
    if (r.ok) setOpps(await r.json())
    setLoading(false)
  }, [artistId])

  useEffect(() => { load() }, [load])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistId, ...form }),
    })
    if (r.ok) { setForm(BLANK); setShowForm(false); load() }
  }

  async function setStatus(id: string, status: ApplicationStatus) {
    await fetch(`/api/opportunities/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(status === 'SUBMITTED' ? { appliedAt: new Date().toISOString() } : {}) }),
    })
    load()
  }

  async function del(id: string) {
    if (!confirm('Remove this opportunity?')) return
    await fetch(`/api/opportunities/${id}`, { method: 'DELETE' })
    load()
  }

  function daysLeft(deadline?: string) {
    if (!deadline) return null
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white font-semibold text-lg">Opportunity Applications</h2>
          <p className="text-gray-400 text-xs mt-0.5">Grants, comps, sync deals &amp; more</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
          <Plus size={14} /> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="mb-5 bg-gray-800 rounded-xl p-4 space-y-3">
          <input required placeholder="Title *" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-500 outline-none focus:ring-1 focus:ring-purple-500" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Organization" value={form.organization}
              onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
              className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-500 outline-none focus:ring-1 focus:ring-purple-500" />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as OpportunityType }))}
              className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-purple-500">
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input type="date" value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-purple-500" />
            <input placeholder="Prize / Award" value={form.prize}
              onChange={e => setForm(f => ({ ...f, prize: e.target.value }))}
              className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-500 outline-none focus:ring-1 focus:ring-purple-500" />
            <input placeholder="Apply URL" value={form.applyUrl}
              onChange={e => setForm(f => ({ ...f, applyUrl: e.target.value }))}
              className="col-span-2 bg-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-500 outline-none focus:ring-1 focus:ring-purple-500" />
            <textarea placeholder="Notes" value={form.notes} rows={2}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="col-span-2 bg-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-500 outline-none focus:ring-1 focus:ring-purple-500 resize-none" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 text-sm px-3 py-1.5 hover:text-white">Cancel</button>
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-1.5 rounded-lg">Save</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-gray-500 text-sm">Loading…</p>
        : opps.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No opportunities yet — add one above.</p>
        ) : (
          <div className="space-y-2">
            {opps.map(opp => {
              const days = daysLeft(opp.deadline)
              const cfg  = STATUS_CFG[opp.status]
              const open = expanded === opp.id
              return (
                <div key={opp.id} className="bg-gray-800 rounded-xl overflow-hidden">
                  <button onClick={() => setExpanded(open ? null : opp.id)}
                    className="w-full flex items-center gap-3 p-3 text-left">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white text-sm font-medium truncate">{opp.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                        <span className="text-gray-500 text-xs">{TYPE_LABELS[opp.type]}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {opp.organization && <span className="text-gray-400 text-xs">{opp.organization}</span>}
                        {opp.prize && <span className="text-green-400 text-xs">{opp.prize}</span>}
                        {days !== null && (
                          <span className={`text-xs ${days < 0 ? 'text-red-400' : days <= 7 ? 'text-yellow-400' : 'text-gray-500'}`}>
                            {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>

                  {open && (
                    <div className="px-3 pb-3 border-t border-gray-700 space-y-3">
                      {opp.notes && <p className="text-gray-400 text-xs mt-3">{opp.notes}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-gray-500 text-xs self-center">Status:</span>
                        {(Object.keys(STATUS_CFG) as ApplicationStatus[]).map(s => (
                          <button key={s} onClick={() => setStatus(opp.id, s)}
                            className={`text-xs px-2 py-0.5 rounded-full transition-opacity ${STATUS_CFG[s].cls} ${opp.status === s ? 'opacity-100 ring-1 ring-white/30' : 'opacity-40 hover:opacity-80'}`}>
                            {STATUS_CFG[s].label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 justify-end">
                        {opp.applyUrl && (
                          <a href={opp.applyUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs">
                            Apply <ExternalLink size={11} />
                          </a>
                        )}
                        <button onClick={() => del(opp.id)} className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs">
                          <Trash2 size={11} /> Remove
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
