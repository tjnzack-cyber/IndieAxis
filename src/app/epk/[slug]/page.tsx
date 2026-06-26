// src/app/epk/[slug]/page.tsx  — PUBLIC, no auth required
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Image from 'next/image'
import FanSignupForm from '@/components/FanSignupForm'

interface Props { params: Promise<{ slug: string }> }

// Force dynamic rendering — no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const epk = await prisma.ePK.findUnique({
    where: { slug },
    include: { artist: true },
  })
  if (!epk || !epk.isPublic) return { title: 'Not Found' }
  return {
    title: `${epk.artist.name} – Press Kit | IndieAxis`,
    description: epk.description?.slice(0, 160),
  }
}

export default async function EPKPublicPage({ params }: Props) {
  const { slug } = await params
  const epk = await prisma.ePK.findUnique({
    where: { slug },
    include: {
      artist: true,
      photos: { orderBy: { order: 'asc' } },
    },
  })

  if (!epk || !epk.isPublic) notFound()

  // Pull upcoming releases for this artist to showcase on the public page
  const releases = await prisma.release.findMany({
    where: {
      artistId: epk.artistId,
      status: { in: ['READY', 'RELEASED'] },
    },
    orderBy: { releaseDate: 'desc' },
    take: 6,
  })

  const primaryPhoto = epk.photos.find((p) => p.isPrimary) ?? epk.photos[0]
  const galleryPhotos = epk.photos.filter((p) => p.id !== primaryPhoto?.id)
  const pressQuotes   = epk.pressQuotes as string[] | null
  const musicLinks    = epk.musicLinks  as Record<string, string> | null

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-end">
        {primaryPhoto && (
          <Image
            src={primaryPhoto.url}
            alt={epk.artist.name}
            fill
            className="object-cover object-center opacity-60 scale-75"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
        <div className="relative z-10 px-6 pb-10 max-w-4xl">
          <p className="text-xs uppercase tracking-widest text-purple-400 mb-2">Electronic Press Kit</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{epk.artist.name}</h1>
          {epk.title && <p className="mt-2 text-lg sm:text-xl text-gray-300">{epk.title}</p>}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-14">

        {/* Bio / Description */}
        {(epk.description || epk.artist.bio) && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-purple-400 mb-4">About</h2>
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
              {epk.description ?? epk.artist.bio}
            </p>
          </section>
        )}

        {/* Press Quotes */}
        {pressQuotes && pressQuotes.length > 0 && (
          <section className="space-y-4">
            {pressQuotes.map((q, i) => (
              <blockquote key={i} className="border-l-4 border-purple-500 pl-6 italic text-gray-300 text-lg">
                {q}
              </blockquote>
            ))}
          </section>
        )}

        {/* Latest Releases */}
        {releases.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-purple-400 mb-4">Releases</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {releases.map((r) => (
                <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{r.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {r.type.charAt(0) + r.type.slice(1).toLowerCase()}
                      {r.releaseDate && ` · ${new Date(r.releaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                    </p>
                  </div>
                  {r.status === 'RELEASED' && (
                    <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded-full flex-shrink-0">Out now</span>
                  )}
                  {r.status === 'READY' && (
                    <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded-full flex-shrink-0">Coming soon</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photo Gallery */}
        {galleryPhotos.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-purple-400 mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {galleryPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? ''}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Photos available for press use.
            </p>
          </section>
        )}

        {/* Music Links */}
        {musicLinks && Object.keys(musicLinks).length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-purple-400 mb-4">Listen</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(musicLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-full border border-white/20 text-sm hover:border-purple-400 hover:text-purple-400 transition-colors capitalize"
                >
                  {platform}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Fan mailing list signup */}
        <section className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/20 rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Stay in the loop</h2>
          <p className="text-gray-400 text-sm mb-5">
            Get notified about new releases, shows, and updates from {epk.artist.name}.
          </p>
          <FanSignupForm artistId={epk.artistId} />
        </section>

        {/* Footer — IndieAxis branding for organic marketing exposure */}
        <footer className="border-t border-white/10 pt-8 text-center space-y-3">
          <p className="text-xs text-gray-600">
            This press kit and fan page is powered by{' '}
            <a href="https://indie-axis.vercel.app" target="_blank" rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 font-semibold">
              IndieAxis
            </a>
            {' '}— the all-in-one toolkit for independent artists.
          </p>
          <a
            href="https://indie-axis.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white px-4 py-2 rounded-full transition-colors"
          >
            Build your own free press kit →
          </a>
        </footer>
      </div>
    </main>
  )
}
