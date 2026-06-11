'use client';

import { cn } from '@/lib/utils';
import { Bell, Briefcase, DollarSign, Lightbulb, Play, X } from 'lucide-react';
import { useState } from 'react';

type NotifType = 'GIG' | 'FUNDING' | 'MARKETING' | 'LEARNING';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  actionLabel?: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'GIG',
      title: 'The Windmill - Brixton Indie Night',
      description: 'High match score (95%) for your genre. 3 slots remaining for June 15th.',
      time: '2m ago',
      isRead: false,
      actionLabel: 'Quick Apply'
    },
    {
      id: '2',
      type: 'FUNDING',
      title: 'PRS Foundation - Momentum Music Fund',
      description: 'Deadline approaching in 3 days. Your EPK is 90% ready for this application.',
      time: '1h ago',
      isRead: true,
      actionLabel: 'Start Application'
    },
    {
      id: '3',
      type: 'MARKETING',
      title: 'Pitch to Spotify Editorial',
      description: 'Your release "Neon Dreams" is 14 days away. Pitch now for best placement odds!',
      time: '5h ago',
      isRead: true,
      actionLabel: 'Go to Pitching Tool'
    }
  ]);

  const getTypeStyles = (type: NotifType) => {
    switch (type) {
      case 'GIG': return 'border-cyan-500 text-cyan-500';
      case 'FUNDING': return 'border-amber-500 text-amber-500';
      case 'MARKETING': return 'border-indigo-500 text-indigo-500';
      default: return 'border-zinc-500 text-zinc-500';
    }
  };

  const getIcon = (type: NotifType) => {
    switch (type) {
      case 'GIG': return <Briefcase size={20} />;
      case 'FUNDING': return <DollarSign size={20} />;
      case 'MARKETING': return <Lightbulb size={20} />;
      default: return <Play size={20} />;
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="text-cyan-500" size={20} />
          Alert Center
        </h2>
        <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">
          Mark all as read
        </button>
      </header>

      <div className="space-y-4">
        {notifications.map(notif => (
          <div 
            key={notif.id}
            className={cn(
              "bg-zinc-900 rounded-xl p-4 border-l-4 transition-all cursor-pointer hover:bg-zinc-800 relative group",
              getTypeStyles(notif.type),
              !notif.isRead && "ring-1 ring-white/5"
            )}
          >
            {!notif.isRead && (
              <div className="absolute top-3 right-3 w-2 h-2 bg-cyan-500 rounded-full" />
            )}
            
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                {notif.type} Match
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">{notif.time}</span>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm truncate">{notif.title}</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{notif.description}</p>
                
                {notif.actionLabel && (
                  <div className="flex gap-2 mt-4">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors">
                      {notif.actionLabel}
                    </button>
                    <button className="border border-indigo-600/30 text-indigo-400 px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600/10 transition-colors">
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <button className="absolute top-2 right-2 p-1 text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
