'use client'
// src/components/FanCRM.tsx

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Search, Mail, Phone, MapPin, Instagram, Twitter, Users, ChevronDown, Tag, X } from 'lucide-react'

type ContactType = 'FAN' | 'INDUSTRY' | 'PRESS' | 'VENUE' | 'PLAYLIST_CURATOR' | 'LABEL' | 'OTHER'

interface FanContact {
  id: string
  name: string
  email?: string
  phone?: string
  type: ContactType
  tags: string[]
  notes?: string
  location?: string
  instagram?: string
  twitter?: string
  metAt?: string
  createdAt: string
}

const TYPE_CONFIG: Record<ContactType, { label: string; color: string; bg: string }> = {
  FAN:               { label: 'Fan',               color: 'text-pink-400',   bg: 'bg-pink-900/40'   },
  INDUSTRY:          { label: 'Industry',          color: 'text-blue-400',   bg: 'bg-blue-900/40'   },
  PRESS:             { label: 'Press',             color: 'text-yellow-400', bg: 'bg-yellow-900/40' },
  VENUE:             { label: 'Venue',             color: 'text-green-400',  bg: 'bg-green-900/40'  },
  PLAYLIST_CURATOR:  { label: 'Curator',           color: 'text-purple-400', bg: 'bg-purple-900/40' },
  LABEL:             { label: 'Label',             color: 'text-cyan-400',   bg: 'bg-cyan-900/40'   },
  OTHER:             { label: 'Other',             color: 'text-zinc-400',   bg: 'bg-zinc-800'      },
}

const BLANK = {
  name: '', email: '', phone: '', type: 'FAN' as ContactType,
  location: '', instagram: '', twitter: '', metAt: '', notes: '', tagInput: '',
}

export default function FanCRM({ artistId }: { artistId: string }) {
  const [contacts, setContacts]   = useState<FanContact[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterType, setFilter]   = useState<ContactType | 'ALL'>('ALL')
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(BLANK)
  const [tags, setTags]           = useState<string[]>([])

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/fans?artistId=${artistId}`)
      if (r.ok) { const data = await r.json(); setContacts(Array.isArray(data) ? data : []) }
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [artistId])

  useEffect(() => { load() }, [load])

  function addTag() {
    const t = form.tagInput.trim()
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setForm(f => ({ ...f, tagInput: '' }))
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  async function addContact(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/fans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artistId,
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        type: form.type,
        tags,
        notes: form.notes || undefined,
        location: form.location || undefined,
        instagram: form.instagram || undefined,
        twitter: form.twitter || undefined,
        metAt: form.metAt || undefined,
      }),
    })
    if (r.ok) {
      setForm(BLANK); setTags([]); setShowForm(false); load()
    }
  }

  async function deleteContact(id: string) {
    if (!confirm('Remove this contact?')) return
    await fetch(`/api/fans/${id}`, { method: 'DELETE' })
    load()
  }

  const filtered = contacts
    .filter(c => filterType === 'ALL' || c.type === filterType)
    .filter(c => {
      if (!search) return true
      const q = search.toLowerCase()
      return c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
    })

  const counts = contacts.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="md:col-span-4 bg-gradient-to-r from-[#6c5ce7] to-pink-500 rounded-xl p-4 text-white flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider opacity-80 mb-1">Total Contacts</p>
            <p className="text-3xl font-black">{contacts.length}</p>
          </div>
          <Users size={40} className="opacity-20" />
        </div>
        {Object.entries(counts).map(([type, count]) => {
          const cfg = TYPE_CONFIG[type as ContactType]
          return (
            <div key={type} className={`${cfg.bg} rounded-xl p-3 border border-white/5`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${cfg.color} mb-1`}>{cfg.label}</p>
              <p className="text-white font-bold text-lg">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            placeholder="Search by name, email, location, tag…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-900 text-white text-sm rounded-lg pl-8 pr-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500 border border-zinc-800"
          />
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#6c5ce7] to-pink-500 hover:opacity-90 text-white text-sm px-4 py-2 rounded-lg flex-shrink-0">
          <Plus size={14} /> Add Contact
        </button>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('ALL')}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterType === 'ALL' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}>
          All ({contacts.length})
        </button>
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => counts[type] ? (
          <button key={type} onClick={() => setFilter(type as ContactType)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterType === type ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}>
            {cfg.label} ({counts[type]})
          </button>
        ) : null)}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={addContact} className="bg-zinc-900 rounded-xl p-4 space-y-3 border border-zinc-800">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Full name *" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="col-span-2 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ContactType }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500">
              {Object.entries(TYPE_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </select>
            <input placeholder="Location" value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
            <input placeholder="Email" value={form.email} type="email"
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
            <input placeholder="Phone" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
            <input placeholder="Instagram handle" value={form.instagram}
              onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
            <input placeholder="Met at (e.g. Afropunk 2026)" value={form.metAt}
              onChange={e => setForm(f => ({ ...f, metAt: e.target.value }))}
              className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>

          {/* Tags */}
          <div>
            <div className="flex gap-2">
              <input placeholder="Add tag (e.g. superfan, booker)" value={form.tagInput}
                onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
              <button type="button" onClick={addTag} className="text-indigo-400 hover:text-indigo-300 text-xs px-3">Add</button>
            </div>
            {tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 bg-indigo-900/50 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                    {t}
                    <button type="button" onClick={() => removeTag(t)}><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <textarea placeholder="Notes" value={form.notes} rows={2}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowForm(false); setForm(BLANK); setTags([]) }}
              className="text-zinc-400 text-sm px-3 py-1.5 hover:text-white">Cancel</button>
            <button type="submit"
              className="bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white text-sm px-4 py-1.5 rounded-lg">Save</button>
          </div>
        </form>
      )}

      {/* Contact list */}
      {loading ? <p className="text-zinc-500 text-sm">Loading…</p>
        : filtered.length === 0 ? (
          <div className="text-center py-10">
            <Users size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">
              {search ? 'No contacts match your search.' : 'No contacts yet — add your first one above.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(contact => {
              const open = expanded === contact.id
              const cfg = TYPE_CONFIG[contact.type]
              const initials = contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              return (
                <div key={contact.id} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                  <button onClick={() => setExpanded(open ? null : contact.id)} className="w-full p-4 text-left">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-xs font-bold ${cfg.color}`}>{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-zinc-900 dark:text-white text-sm font-semibold">{contact.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                          {contact.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {contact.email && <span className="text-zinc-500 text-xs">{contact.email}</span>}
                          {contact.location && <span className="flex items-center gap-0.5 text-zinc-500 text-xs"><MapPin size={10} />{contact.location}</span>}
                          {contact.metAt && <span className="text-zinc-600 text-xs">Met at: {contact.metAt}</span>}
                        </div>
                      </div>
                      <ChevronDown size={13} className={`text-zinc-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-zinc-800 px-4 pb-4 pt-3 space-y-3">
                      <div className="flex flex-wrap gap-4">
                        {contact.email && (
                          <span className="flex items-center gap-1.5 text-zinc-400 text-xs">
                            <Mail size={13} /> {contact.email}
                          </span>
                        )}
                        {contact.phone && (
                          <span className="flex items-center gap-1.5 text-zinc-400 text-xs">
                            <Phone size={13} /> {contact.phone}
                          </span>
                        )}
                        {contact.instagram && (
                          <a href={`https://instagram.com/${contact.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 text-xs">
                            <Instagram size={13} /> {contact.instagram}
                          </a>
                        )}
                        {contact.twitter && (
                          <a href={`https://twitter.com/${contact.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs">
                            <Twitter size={13} /> {contact.twitter}
                          </a>
                        )}
                      </div>

                      {contact.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          <Tag size={12} className="text-zinc-600 self-center" />
                          {contact.tags.map(t => (
                            <span key={t} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      )}

                      {contact.notes && (
                        <p className="text-zinc-500 text-xs italic border-l-2 border-zinc-700 pl-3">{contact.notes}</p>
                      )}

                      <div className="flex justify-end">
                        <button onClick={() => deleteContact(contact.id)}
                          className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs">
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
