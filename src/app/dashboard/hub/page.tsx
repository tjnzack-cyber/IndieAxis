'use client';

import { useState } from 'react';
import EducationalHub from '@/components/EducationalHub';
import RoyaltyCollection from '@/components/RoyaltyCollection';
import Link from 'next/link';
import { ChevronLeft, GraduationCap, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'edu' | 'royalty';

export default function HubPage() {
  const [activeTab, setActiveTab] = useState<Tab>('edu');

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <Link 
            href="/dashboard/profile" 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={20} />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight">IndieAxis Hub</h1>
          <p className="text-zinc-500 mt-1">Your tools for success and revenue.</p>
        </header>

        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('edu')}
            className={cn(
              "px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 border",
              activeTab === 'edu' 
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            )}
          >
            <GraduationCap size={18} />
            Educational Hub
          </button>
          <button 
            onClick={() => setActiveTab('royalty')}
            className={cn(
              "px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 border",
              activeTab === 'royalty' 
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
            )}
          >
            <Coins size={18} />
            Royalty Collection
          </button>
        </div>

        <main className="mt-8">
          {activeTab === 'edu' ? <EducationalHub /> : <RoyaltyCollection />}
        </main>
      </div>
    </div>
  );
}
