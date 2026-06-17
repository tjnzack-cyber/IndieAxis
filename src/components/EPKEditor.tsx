'use client'
// src/components/EPKEditor.tsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { Copy, Check, Globe, Upload, Trash2, Star, Eye } from 'lucide-react'
import Image from 'next/image'

interface EPKPhoto { id: string; url: string; caption?: string; order: number; isPrimary: boolean }
interface EPK {
  id: string; slug: string; isPublic: boolean
  title?: string; description?: string; pressQuotes?: string[]
  musicLinks?: Record<string, string>
  photos: EPKPhoto[]
}

export default function EPKEditor({ artistId, artistName }: { artistId: string; artistName: string }) {
  const [epks, setEpks]         = useState<EPK[]>([])
  const [epk, setEPK]           = useState<EPK | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied]     = useState(false)
  const fileRef                 = useRef<HTMLInputElement>(null)

  const defaultSlug = artistName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const [form, setForm] = useState({
    slug: defaultSlug,
    title: artistName,
    description: '',
    spotify: '',
    appleMusic: '',
    youtube: '',
    soundcloud: '',
  })

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/epk?artistId=${artistId}`)
      if (r.ok) {
        const data = await r.json()
        const list: EPK[] = Array.isArray(data) ? data : []
        setEpks(list)
        if (list.length > 0) {
          const first = list[0]
          setEPK(first)
          const links = (first.musicLinks as Record<string, string>) ?? {}
          setForm({
            slug: first.slug,
            title: first.title ?? artistName,
            description: first.description ?? '',
            spotify: links.spotify ?? '',
            appleMusic: links.appleMusic ?? '',
            youtube: links.youtube ?? '',
            soundcloud: links.soundcloud ?? '',
          })
        }
      }
    } catch (e) {
      console.error('EPK load error', e)
    }
    setLoading(false)
  }, [artistId, artistName])

  useEffect(() => { load() }, [load])

  async function save(isPublic?: boolean) {
    setSaving(true)
    const musicLinks: Record<string, string> = {}
    if (form.spotify)    musicLinks.spotify    = form.spotify
    if (form.appleMusic) musicLinks.appleMusic = form.appleMusic
    if (form.youtube)    musicLinks.youtube    = form.youtube
    if (form.soundcloud) musicLinks.soundcloud = form.soundcloud

    await fetch('/api/epk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artistId,
        slug: form.slug,
        title: form.title,
        description: form.description,
        musicLinks,
        ...(isPublic !== undefined ? { isPublic } : {}),
      }),
    })
    await load()
    setSaving(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(`https://indie-axis.vercel.app/epk/${form.slug}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!epk || !files.length) return
    setUploading(true)
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const { url } = await uploadRes.json()
        if (url) {
          await fetch('/api/epk/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ epkId: epk.id, url, isPrimary: epk.photos.length === 0 }),
          })
        }
      } catch (err) {
        console.error('Upload error', err)
      }
    }
    await load(); setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function setPrimary(id: string) {
    await fetch(`/api/epk/photos/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPrimary: true }),
    }); load()
  }

  async function delPhoto(id: string) {
    await fetch(`/api/epk/photos/${id}`, { method: 'DELETE' }); load()
  }

  if (loading) return <div className="bg-zinc-800/50 rounded-2xl p-6 text-zinc-500 text-sm">Loading EPK…</div>

  const publicUrl = `https://indie-axis.vercel.app/epk/${form.slug}`

  return (
    <div className="bg-zinc-800/50 rounded-2xl p-6 space-y-5 border border-zinc-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">Electronic Press Kit</h2>
          <p className="text-zinc-400 text-xs mt-0.5">Your public profile for press &amp; industry</p>
        </div>
        <div className="flex items-center gap-2">
          {epk?.isPublic && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs">
              <Eye size={13} /> Preview
            </a>
          )}
          <button onClick={() => save(!epk?.isPublic)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors
              ${epk?.isPublic
                ? 'bg-green-900/50 text-green-400 hover:bg-red-900/40 hover:text-red-400'
                : 'bg-zinc-700 text-zinc-400 hover:bg-green-900/40 hover:text-green-400'}`}>
            <Globe size={13} />
            {epk?.isPublic ? 'Published' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Public link */}
      <div className="flex items-center gap-2 bg-zinc-900 rounded-xl px-4 py-3">
        <span className="text-zinc-500 text-xs flex-1 truncate">{publicUrl}</span>
        <button onClick={copyLink} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs">
          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <label className="text-zinc-400 text-xs mb-1 block">URL Slug</label>
          <div className="flex items-center bg-zinc-900 rounded-lg overflow-hidden">
            <span className="text-zinc-600 text-xs px-3 border-r border-zinc-700 py-2 select-none">/epk/</span>
            <input value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
              className="flex-1 bg-transparent text-white text-sm px-3 py-2 outline-none" />
          </div>
        </div>
        <div>
          <label className="text-zinc-400 text-xs mb-1 block">EPK Title</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-zinc-900 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-zinc-400 text-xs mb-1 block">Bio / Description</label>
          <textarea value={form.description} rows={4}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Your artist story…"
            className="w-full bg-zinc-900 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
        </div>
      </div>

      {/* Streaming links */}
      <div>
        <label className="text-zinc-400 text-xs mb-2 block">Streaming Links</label>
        <div className="grid grid-cols-2 gap-2">
          {(['spotify', 'appleMusic', 'youtube', 'soundcloud'] as const).map(p => (
            <input key={p}
              placeholder={p === 'appleMusic' ? 'Apple Music URL' : p.charAt(0).toUpperCase() + p.slice(1) + ' URL'}
              value={form[p]}
              onChange={e => setForm(f => ({ ...f, [p]: e.target.value }))}
              className="bg-zinc-900 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500" />
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-zinc-400 text-xs">Press Photos</label>
          <button onClick={() => { if (!epk) { save(); } else { fileRef.current?.click() } }}
            disabled={uploading}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-40">
            <Upload size={12} /> {uploading ? 'Uploading…' : epk ? 'Upload' : 'Save first to upload'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </div>

        {epk && (epk.photos ?? []).length === 0 && (
          <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center cursor-pointer"
            onClick={() => fileRef.current?.click()}>
            <Upload size={20} className="text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-600 text-xs">Upload press photos</p>
          </div>
        )}

        {epk && (epk.photos ?? []).length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {(epk.photos ?? []).map(photo => (
              <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-zinc-800">
                <Image src={photo.url} alt={photo.caption ?? ''} fill className="object-cover" />
                {photo.isPrimary && (
                  <div className="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded">Primary</div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!photo.isPrimary && (
                    <button onClick={() => setPrimary(photo.id)}
                      className="p-1.5 bg-zinc-900 rounded-lg text-yellow-400 hover:text-yellow-300">
                      <Star size={13} />
                    </button>
                  )}
                  <button onClick={() => delPhoto(photo.id)}
                    className="p-1.5 bg-zinc-900 rounded-lg text-red-400 hover:text-red-300">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => save()} disabled={saving}
        className="w-full bg-gradient-to-r from-[#6c5ce7] to-pink-500 hover:opacity-90 disabled:opacity-50 text-white text-sm py-2.5 rounded-xl font-bold transition-all">
        {saving ? 'Saving…' : 'Save EPK'}
      </button>
    </div>
  )
}
