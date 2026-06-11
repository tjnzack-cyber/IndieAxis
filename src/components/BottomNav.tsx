'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Music, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      icon: Home,
      href: '/dashboard/profile',
    },
    {
      label: 'Strategy',
      icon: Calendar,
      href: '/dashboard/marketing',
    },
    {
      label: 'Gigs',
      icon: Music,
      href: '/dashboard/opportunities',
    },
    {
      label: 'EPK',
      icon: User,
      href: '/dashboard/profile', // For now, EPK is part of profile
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-zinc-800 px-6 py-3 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-cyan-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
