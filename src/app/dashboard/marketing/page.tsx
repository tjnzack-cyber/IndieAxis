'use client';

import { useEffect, useState } from 'react';
import { ArtistProfile, User } from '@/types';
import MarketingPlanGenerator from '@/components/ai/MarketingPlanGenerator';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface ArtistProfileExtended extends ArtistProfile {
  user: User;
}

export default function MarketingPage() {
  const [artist, setArtist] = useState<ArtistProfileExtended | null>(null);
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
        Loading your strategy...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b1a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-pink-400 transition-colors mb-4"
          >
            <ChevronLeft size={20} />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Marketing Strategy
          </h1>
          <p className="text-zinc-500 mt-1">
            AI-powered marketing plans tailored to your career
          </p>
        </header>

        <MarketingPlanGenerator
          defaultName={artist?.name}
          defaultGenre={artist?.genre || ''}
          defaultLocation={artist?.location || ''}
        />
      </div>
    </div>
  );
}
