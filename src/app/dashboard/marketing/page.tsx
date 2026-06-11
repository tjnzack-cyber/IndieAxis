'use client';

import { useEffect, useState } from 'react';
import { ArtistProfile, MarketingPlan, MarketingTask, User } from '@/types';
import MarketingPlanRoadmap from '@/components/MarketingPlanRoadmap';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { isPremium } from '@/lib/utils';

interface ArtistProfileExtended extends ArtistProfile {
  user: User;
  marketingPlans: MarketingPlan[];
}

export default function MarketingPage() {
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

  if (loading) return <div className="p-8 text-center text-white bg-black min-h-screen">Loading your strategy...</div>;
  if (!artist || !artist.marketingPlans || artist.marketingPlans.length === 0) {
    return <div className="p-8 text-center text-white bg-black min-h-screen">No marketing plans found.</div>;
  }

  const activePlan = artist.marketingPlans.find(p => p.status === 'ACTIVE') || artist.marketingPlans[0];

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link 
          href="/dashboard/profile" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          Back to Dashboard
        </Link>
        
        <MarketingPlanRoadmap 
          plan={activePlan} 
          premium={isPremium(artist.user)} 
        />
      </div>
    </div>
  );
}
