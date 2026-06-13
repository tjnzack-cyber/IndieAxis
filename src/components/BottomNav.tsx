'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Music, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();

const navItems = [
    { label: 'Home', icon: Home, href: '/dashboard/profile' },
    { label: 'Strategy', icon: Calendar, href: '/dashboard/marketing' },
    { label: 'Gigs', icon: Music, href: '/dashboard/opportunities' },
    { label: 'EPK', icon: FileText, href: '/dashboard/epk' },
    { label: 'Hub', icon: Sparkles, href: '/dashboard/hub' },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0b0b1a]/90 backdrop-blur-lg border-t border-purple-500/20 px-4 py-3 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 transition-colors',
                isActive ? 'text-pink-400' : 'text-zinc-500 hover:text-purple-300'
              )}
            >
              <Icon size={18} />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
