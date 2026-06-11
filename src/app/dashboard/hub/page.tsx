'use client';

import { useEffect, useState } from 'react';
import { ArtistProfile } from '@/types';
import EducationalHub from '@/components/EducationalHub';
import RoyaltyBodiesGenerator from '@/components/ai/RoyaltyBodiesGenerator';
import SocialStrategyGenerator from '@/components/ai/SocialStrategyGenerator';
import Link from 'next/link';
import { ChevronLeft, GraduationCap, Coins, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'edu' | 'social' | 'royalty';

export default function HubPage() {
  const [activeTab, setActiveTab] = useState<Tab>('social');
  const [artist, setArtist] = useState<ArtistProfile | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => setArtist(data))
      .catch(() => {});
  }, []);

  const tabs: { id: Tab; label: string; icon: typeof Share2 }[] = [
    { id: 'social', label: 'Social Strategy', icon: Share2 },
    { id: 'royalty', label: 'Royalty Collection', icon: Coins },
    { id: 'edu', label: 'Educational Hub', icon: GraduationCap },
  ];

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
            IndieAxis Hub
          </h1>
          <p className="text-zinc-500 mt-1">
            AI tools for growth, social media, and revenue.
          </p>
        </header>

        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 border',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#6c5ce7] to-pink-500 border-transparent text-white shadow-lg shadow-purple-500/20'
                    : 'bg-[#080814] border-purple-500/20 text-zinc-400 hover:border-pink-500/30'
                )}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <main className="mt-8">
          {activeTab === 'social' && (
            <SocialStrategyGenerator
              defaultName={artist?.name}
              defaultGenre={artist?.genre || ''}
              defaultLocation={artist?.location || ''}
            />
          )}
          {activeTab === 'royalty' && (
            <RoyaltyBodiesGenerator
              defaultCountry={artist?.location || ''}
              defaultGenre={artist?.genre || ''}
            />
          )}
          {activeTab === 'edu' && <EducationalHub />}
        </main>
      </div>
    </div>
  );
}
