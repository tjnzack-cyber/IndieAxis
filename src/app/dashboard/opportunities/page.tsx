'use client';

import { useEffect, useState } from 'react';
import { ArtistProfile, Gig, GigApplication, EPK, User } from '@/types';
import GigMatching from '@/components/GigMatching';
import PitchingCalendar from '@/components/PitchingCalendar';
import Link from 'next/link';
import { ChevronLeft, MapPin } from 'lucide-react';

interface ArtistProfileExtended extends ArtistProfile {
  user: User;
  epks: EPK[];
  gigApplications: (GigApplication & { gig: Gig })[];
}

export default function OpportunitiesPage() {
  const [artist, setArtist] = useState<ArtistProfileExtended | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setArtist(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading artist profile:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-white bg-black min-h-screen">Loading opportunities...</div>;
  if (!artist) return <div className="p-8 text-center text-white bg-black min-h-screen">Artist profile not found.</div>;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <Link 
              href="/dashboard/profile" 
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft size={20} />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-white tracking-tight">Mini-Manager</h1>
            <p className="text-zinc-500 mt-1">Opportunity pipeline for <strong className="text-zinc-300">{artist.name}</strong></p>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 self-end md:self-auto">
            <MapPin size={16} />
            {artist.location}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <GigMatching artist={artist} />
          </div>
          <aside>
            <PitchingCalendar />
          </aside>
        </div>
      </div>
    </div>
  );
}
