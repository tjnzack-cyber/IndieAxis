'use client';
import { useEffect, useState } from 'react';
import { ArtistProfile } from '@/types';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function AnalyticsPage() {
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => { setArtist(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-white bg-[#0b0b1a] min-h-screen">Loading analytics...</div>;

  return (
    <div className="min-h-screen bg-[#0b0b1a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <Link href="/dashboard/profile"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-pink-400 transition-colors mb-4">
            <ChevronLeft size={20} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight">Analytics</h1>
          <p className="text-zinc-500 mt-1">Track your growth, revenue and release progress over time</p>
        </header>
        {artist && (
          <AnalyticsDashboard
            artistId={artist.id}
            artistName={artist.name}
            artistLocation={artist.location}
          />
        )}
      </div>
    </div>
  );
}
