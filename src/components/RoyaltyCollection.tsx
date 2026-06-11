'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, ExternalLink, Globe, Landmark } from 'lucide-react';
import { useState } from 'react';

interface Organization {
  name: string;
  collects: string;
  url: string;
}

interface Region {
  name: string;
  orgs: Organization[];
}

export default function RoyaltyCollection() {
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Register with a local PRO (ASCAP, BMI, PRS, etc.)', completed: false },
    { id: 2, text: 'Sign up for Digital Collection (SoundExchange)', completed: false },
    { id: 3, text: 'Register mechanical rights (The MLC, MCPS)', completed: false }
  ]);

  const toggleCheck = (id: number) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const regions: Region[] = [
    {
      name: 'United States',
      orgs: [
        { name: 'ASCAP / BMI', collects: 'Performance Royalties (Live, Radio)', url: 'https://ascap.com' },
        { name: 'The MLC', collects: 'Mechanical Royalties (Streaming)', url: 'https://themlc.com' },
        { name: 'SoundExchange', collects: 'Digital Performance (Webcasts)', url: 'https://soundexchange.com' }
      ]
    },
    {
      name: 'United Kingdom',
      orgs: [
        { name: 'PRS for Music', collects: 'Performance & Mechanical', url: 'https://prsformusic.com' },
        { name: 'PPL', collects: 'Public Performance (Neighbouring Rights)', url: 'https://ppluk.com' }
      ]
    },
    {
      name: 'Nigeria & Africa',
      orgs: [
        { name: 'MCSN', collects: 'Musical Works Copyright', url: 'https://mcsn-ng.com' },
        { name: 'Yamaha Music Africa', collects: 'Digital Distribution & Publishing', url: '#' }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6">
        <h3 className="text-cyan-500 font-bold flex items-center gap-2 mb-4">
          <CheckCircle2 size={18} />
          Royalty Readiness Checklist
        </h3>
        <div className="space-y-3">
          {checklist.map(item => (
            <div 
              key={item.id} 
              onClick={() => toggleCheck(item.id)}
              className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer group"
            >
              {item.completed ? (
                <CheckCircle2 className="text-cyan-500" size={18} />
              ) : (
                <Circle className="text-zinc-600 group-hover:text-zinc-400 transition-colors" size={18} />
              )}
              <span className={cn(item.completed && "text-zinc-500 line-through")}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {regions.map((region, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-white/5 px-6 py-3 border-b border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Globe size={14} className="text-indigo-400" />
                {region.name}
              </span>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {region.orgs.map((org, j) => (
                <div key={j} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                  <div>
                    <h4 className="font-bold text-zinc-200 text-sm">{org.name}</h4>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">{org.collects}</p>
                  </div>
                  <a 
                    href={org.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-500 hover:text-cyan-400 text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
                  >
                    Visit <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
