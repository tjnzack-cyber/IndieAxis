'use client';

import { Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

export default function AIResultPanel({ title, children }: Props) {
  return (
    <div className="bg-[#0b0b1a] border border-pink-500/20 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 py-4 border-b border-pink-500/20 bg-gradient-to-r from-pink-900/20 to-purple-900/20 flex items-center gap-2">
        <Sparkles size={18} className="text-pink-400" />
        <h3 className="font-bold text-white">{title}</h3>
        <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-pink-400/80 bg-pink-500/10 px-2 py-1 rounded-full border border-pink-500/20">
          AI Generated
        </span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
