'use client'
import { useEffect, useState } from 'react'
import { ArtistProfile } from '@/types'
import ReleasePlanner from '@/components/ReleasePlanner'
import PageLoader from '@/components/PageLoader'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function ReleasesPage() {
  const [artist, setArtist] = useState<ArtistProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => { setArtist(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader message="Loading your releases…" />

  return (
    <div className="min-h-screen bg-[#0b0b1a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <Link href="/dashboard/profile"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-pink-400 transition-colors mb-4">
            <ChevronLeft size={20} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight">Release Planner</h1>
          <p className="text-zinc-500 mt-1">Plan every step from idea to release day</p>
        </header>
        {artist && <ReleasePlanner artistId={artist.id} />}
      </div>
    </div>
  )
}
