'use client';

import { PitchingWindow } from '@/types';
import { cn } from '@/lib/utils';
import { Calendar, ChevronRight, HelpCircle } from 'lucide-react';

export default function PitchingCalendar() {
  // Mock data based on research
  const windows = [
    { month: 'JAN', title: 'The Great Escape', deadline: 'Applications close Feb 28' },
    { month: 'MAR', title: 'Summer Festivals', deadline: 'UK Festival side stage deadlines' },
    { month: 'JUN', title: 'Americanafest (US)', deadline: 'Deadline for Sept event' },
    { month: 'SEP', title: 'SXSW 2027', deadline: 'Early bird applications open' },
    { month: 'OCT', title: 'Afro Nation (Lagos)', deadline: 'Jan deadline approaching' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
          Pitching Deadlines
          <Calendar size={18} className="text-zinc-500" />
        </h3>
        
        <div className="space-y-1">
          {windows.map((window, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-zinc-800/50 last:border-0 group cursor-pointer hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
              <div className="w-10 text-indigo-400 font-black text-xs tracking-tighter">
                {window.month}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition-colors">{window.title}</h4>
                <p className="text-[10px] text-zinc-500 font-medium truncate uppercase tracking-wider mt-0.5">{window.deadline}</p>
              </div>
              <ChevronRight size={14} className="text-zinc-700 group-hover:text-zinc-500 transition-colors" />
            </div>
          ))}
        </div>

        <button className="w-full mt-6 py-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-500/20 transition-all border-dashed">
          View Full Calendar
        </button>
      </div>

      <div className="bg-gradient-to-br from-indigo-900/40 to-zinc-900 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <HelpCircle size={80} />
        </div>
        <h4 className="text-indigo-300 font-bold text-sm flex items-center gap-2 mb-3">
          Manager Tip 💡
        </h4>
        <p className="text-xs text-zinc-300 leading-relaxed">
          "Submit your Spotify Editorial pitch at least <strong className="text-white">14 days</strong> before release to give curators enough time to listen!"
        </p>
        <button className="mt-4 text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1">
          Learn More <ChevronRight size={10} />
        </button>
      </div>
    </div>
  );
}
