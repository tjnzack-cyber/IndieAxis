// src/app/epk/[slug]/page.tsx  — PUBLIC, no auth required
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Image from 'next/image'

interface Props { params: Promise<{ slug: string }> }

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
            className="object-cover object-top opacity-60"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
        <div className="relative z-10 px-6 pb-10 max-w-4xl">
          <p className="text-xs uppercase tracking-widest text-purple-400 mb-2">Electronic Press Kit</p>
          <h1 className="text-5xl font-bold tracking-tight">{epk.artist.name}</h1>
          {epk.title && <p className="mt-2 text-xl text-gray-300">{epk.title}</p>}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-14">
        {(epk.description || epk.artist.bio) && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-purple-400 mb-4">About</h2>
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
              {epk.description ?? epk.artist.bio}
            </p>
          </section>
        )}

        {pressQuotes && pressQuotes.length > 0 && (
          <section className="space-y-4">
            {pressQuotes.map((q, i) => (
              <blockquote key={i} className="border-l-4 border-purple-500 pl-6 italic text-gray-300 text-lg">
                {q}
              </blockquote>
            ))}
          </section>
        )}

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
          </section>
        )}

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

        <footer className="border-t border-white/10 pt-8 text-xs text-gray-600 flex items-center justify-between">
          <span>Powered by IndieAxis</span>
          <span>indie-axis.vercel.app</span>
        </footer>
      </div>
    </main>
  )
}
