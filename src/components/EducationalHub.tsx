'use client';

import { cn } from '@/lib/utils';
import { ExternalLink, Play, Youtube, Instagram, MessageSquare, Mic, BookOpen } from 'lucide-react';

interface Resource {
  title: string;
  description: string;
  platform: 'YouTube' | 'Instagram' | 'Reddit' | 'Podcast' | 'Blog';
  url: string;
}

export default function EducationalHub() {
  const resources: Resource[] = [
    {
      title: 'Taylor Larson',
      description: 'DIY artist strategies, home production, and independent release tactics.',
      platform: 'YouTube',
      url: 'https://youtube.com/@TaylorLarson'
    },
    {
      title: 'EDM Maven',
      description: 'Production tips and music business education for electronic producers.',
      platform: 'YouTube',
      url: 'https://youtube.com/@EDMMaven'
    },
    {
      title: 'Music Marketing Academy',
      description: 'Strategic marketing guidance specifically for independent music artists.',
      platform: 'Instagram',
      url: 'https://instagram.com/musicmarketingacademy'
    },
    {
      title: 'r/WeAreTheMusicMakers',
      description: 'Peer-to-peer advice on production, distribution, and global marketing.',
      platform: 'Reddit',
      url: 'https://reddit.com/r/wearethemusicmakers'
    },
    {
      title: 'Marketing Manifesto',
      description: 'Tactical, low-budget marketing strategies for artists on a budget.',
      platform: 'Podcast',
      url: '#'
    },
    {
      title: 'CD Baby Blog',
      description: 'Comprehensive guides on EPKs, royalties, and artist promotion.',
      platform: 'Blog',
      url: 'https://cdbaby.com/blog'
    }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'YouTube': return <Youtube size={14} />;
      case 'Instagram': return <Instagram size={14} />;
      case 'Reddit': return <MessageSquare size={14} />;
      case 'Podcast': return <Mic size={14} />;
      default: return <BookOpen size={14} />;
    }
  };

  const getPlatformStyles = (platform: string) => {
    switch (platform) {
      case 'YouTube': return 'bg-red-500/10 text-red-500';
      case 'Instagram': return 'bg-pink-500/10 text-pink-500';
      case 'Reddit': return 'bg-orange-500/10 text-orange-500';
      case 'Podcast': return 'bg-indigo-500/10 text-indigo-500';
      default: return 'bg-cyan-500/10 text-cyan-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((res, i) => (
        <a 
          key={i} 
          href={res.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-indigo-500/50 hover:-translate-y-1 transition-all group"
        >
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-4 inline-flex items-center gap-1.5",
            getPlatformStyles(res.platform)
          )}>
            {getPlatformIcon(res.platform)}
            {res.platform}
          </span>
          <h3 className="font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors flex items-center justify-between">
            {res.title}
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{res.description}</p>
        </a>
      ))}
    </div>
  );
}
