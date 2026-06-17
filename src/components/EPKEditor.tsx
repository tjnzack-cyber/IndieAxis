'use client'
// src/components/EPKEditor.tsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { Copy, Check, Globe, Upload, Trash2, Star, Eye } from 'lucide-react'
import Image from 'next/image'

interface EPKPhoto { id: string; url: string; caption?: string; order: number; isPrimary: boolean }
interface EPK {
  id: string; slug: string; published: boolean
  bio?: string; tagline?: string; pressQuote?: string
  streamingLinks?: Record<string, string>
  photos: EPKPhoto[]
}

export default function EPKEditor({ artistId, artistName }: { artistId: string; artistName: string }) {
  const [epk, setEPK]           = useState<EPK | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied]     = useState(false)
  const fileRef                 = useRef<HTMLInputElement>(null)

  const defaultSlug = artistName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const [form, setForm] = useState({
    slug: defaultSlug, bio: '', tagline: '', pressQuote: '',
    spotify: '', appleMusic: '', youtube: '', soundcloud: '',
  })

  const load = useCallback(async () => {
    const r = await fetch(`/api/epk?artistId=${artistId}`)
    if (r.ok) {
      const data = await r.json()
      if (data) {
        setEPK(data)
        const links = (data.streamingLinks as Record<string, string>) ?? {}
        setForm({
          slug: data.slug, bio: data.bio ?? '', tagline: data.tagline ?? '',
          pressQuote: data.pressQuote ?? '',
          spotify: links.spotify ?? '', appleMusic: links.appleMusic ?? '',
          youtube: links.youtube ?? '', soundcloud: links.soundcloud ?? '',
        })
      }
    }
    setLoading(false)
  }, [artistId])

  useEffect(() => { load() }, [load])

  async function save(published?: boolean) {
    setSaving(true)
    const streamingLinks: Record<string, string> = {}
    if (form.spotify)    streamingLinks.spotify    = form.spotify
    if (form.appleMusic) streamingLinks.appleMusic = form.appleMusic
    if (form.youtube)    streamingLinks.youtube    = form.youtube
    if (form.soundcloud) streamingLinks.soundcloud = form.soundcloud

    await fetch('/api/epk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artistId, slug: form.slug, bio: form.bio, tagline: form.tagline,
        pressQuote: form.pressQuote, streamingLinks,
        ...(published !== undefined ? { published } : {}),
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
      // TODO: replace with real Cloudinary/S3 upload
      // const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', '...')
      // const r = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD/image/upload', { method: 'POST', body: fd })
      // const { secure_url } = await r.json()
      const url = URL.createObjectURL(file)   // ← stub; swap for secure_url above
      await fetch('/api/epk/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epkId: epk.id, url, isPrimary: epk.photos.length === 0 }),
      })
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

  if (loading) return <div className="bg-gray-900 rounded-2xl p-6 text-gray-500 text-sm">Loading EPK…</div>

  const publicUrl = `https://indie-axis.vercel.app/epk/${form.slug}`

  return (
    <div className="bg-gray-900 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Electronic Press Kit</h2>
          <p className="text-gray-400 text-xs mt-0.5">Your public profile for press &amp; industry</p>
        </div>
        <div className="flex items-center gap-2">
          {epk?.published && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs">
              <Eye size={13} /> Preview
            </a>
          )}
          <button onClick={() => save(!epk?.published)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors
              ${epk?.published
                ? 'bg-green-900/50 text-green-400 hover:bg-red-900/40 hover:text-red-400'
                : 'bg-gray-800 text-gray-400 hover:bg-green-900/40 hover:text-green-400'}`}>
            <Globe size={13} />
            {epk?.published ? 'Published' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Public link */}
      <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-3">
        <span className="text-gray-500 text-xs flex-1 truncate">{publicUrl}</span>
        <button onClick={copyLink} className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs">
          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>

      {/* Slug */}
      <div>
        <label className="text-gray-400 text-xs mb-1 block">URL Slug</label>
        <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
          <span className="text-gray-600 text-xs px-3 border-r border-gray-700 py-2 select-none">/epk/</span>
          <input value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
            className="flex-1 bg-transparent text-white text-sm px-3 py-2 outline-none" />
        </div>
      </div>

      {/* Content fields */}
      <div className="space-y-3">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Tagline</label>
          <input placeholder="One-liner that sums you up" value={form.tagline}
            onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-600 outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Bio</label>
          <textarea placeholder="Your artist story…" value={form.bio} rows={4}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-600 outline-none focus:ring-1 focus:ring-purple-500 resize-none" />
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Press Quote</label>
          <input placeholder={`"${artistName} is one to watch" — Music Blog`} value={form.pressQuote}
            onChange={e => setForm(f => ({ ...f, pressQuote: e.target.value }))}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-600 outline-none focus:ring-1 focus:ring-purple-500" />
        </div>
      </div>

      {/* Streaming links */}
      <div>
        <label className="text-gray-400 text-xs mb-2 block">Streaming Links</label>
        <div className="grid grid-cols-2 gap-2">
          {(['spotify', 'appleMusic', 'youtube', 'soundcloud'] as const).map(p => (
            <input key={p} placeholder={p === 'appleMusic' ? 'Apple Music' : p.charAt(0).toUpperCase() + p.slice(1)}
              value={form[p]}
              onChange={e => setForm(f => ({ ...f, [p]: e.target.value }))}
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-600 outline-none focus:ring-1 focus:ring-purple-500" />
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-gray-400 text-xs">Press Photos</label>
          <button onClick={() => fileRef.current?.click()} disabled={uploading || !epk}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-40">
            <Upload size={12} /> {uploading ? 'Uploading…' : 'Upload'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </div>

        {!epk ? (
          <p className="text-gray-600 text-xs">Save EPK first to upload photos.</p>
        ) : epk.photos.length === 0 ? (
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer"
            onClick={() => fileRef.current?.click()}>
            <Upload size={24} className="text-gray-700 mx-auto mb-2" />
            <p className="text-gray-600 text-xs">Upload press photos</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {epk.photos.map(photo => (
              <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-800">
                <Image src={photo.url} alt={photo.caption ?? ''} fill className="object-cover" />
                {photo.isPrimary && (
                  <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded">Primary</div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!photo.isPrimary && (
                    <button onClick={() => setPrimary(photo.id)} title="Set as primary"
                      className="p-1.5 bg-gray-900 rounded-lg text-yellow-400 hover:text-yellow-300">
                      <Star size={13} />
                    </button>
                  )}
                  <button onClick={() => delPhoto(photo.id)}
                    className="p-1.5 bg-gray-900 rounded-lg text-red-400 hover:text-red-300">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => save()} disabled={saving}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm py-2.5 rounded-xl font-medium transition-colors">
        {saving ? 'Saving…' : 'Save EPK'}
      </button>
    </div>
  )
}
