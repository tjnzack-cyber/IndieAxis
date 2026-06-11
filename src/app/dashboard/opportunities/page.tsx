'use client';

import { useEffect, useState } from 'react';
import { ArtistProfile } from '@/types';
import GigOpportunitiesGenerator from '@/components/ai/GigOpportunitiesGenerator';
import Link from 'next/link';
import { ChevronLeft, MapPin } from 'lucide-react';

export default function OpportunitiesPage() {
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        setArtist(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-white bg-[#0b0b1a] min-h-screen">
        Loading opportunities...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b1a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-pink-400 transition-colors mb-4"
            >
              <ChevronLeft size={20} />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Gig Opportunities
            </h1>
            <p className="text-zinc-500 mt-1">
              AI-matched gigs and pitching windows for{' '}
              <strong className="text-purple-300">{artist?.name}</strong>
            </p>
          </div>
          {artist?.location && (
            <div className="bg-pink-500/10 border border-pink-500/20 text-pink-400 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
              <MapPin size={16} />
              {artist.location}
            </div>
          )}
        </header>

        <GigOpportunitiesGenerator
          defaultName={artist?.name}
          defaultGenre={artist?.genre || ''}
          defaultLocation={artist?.location || ''}
        />
      </div>
    </div>
  );
}
