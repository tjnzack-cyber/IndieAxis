'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, Music, FileText, Sparkles, LogOut, Sun, Moon, MoreHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';
import { useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [showMore, setShowMore] = useState(false);

  // Primary items shown directly in the bar (4 max keeps mobile spacing clean)
  const navItems = [
    { label: 'Home',     icon: Home,     href: '/dashboard/profile' },
    { label: 'Strategy', icon: Calendar, href: '/dashboard/marketing' },
    { label: 'Gigs',     icon: Music,    href: '/dashboard/opportunities' },
    { label: 'EPK',      icon: FileText, href: '/dashboard/epk' },
  ];

  // Secondary items live in the "More" sheet on mobile, inline on desktop
  const moreItems = [
    { label: 'Hub', icon: Sparkles, href: '/dashboard/hub' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (e) {}
    document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = '__Secure-next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  return (
    <>
      <div className="h-20" />

      {/* Mobile "More" sheet */}
      {showMore && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            onClick={e => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-[var(--card)] rounded-t-2xl p-4 pb-8 border-t border-purple-500/20 animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[var(--foreground)] font-bold text-sm">More</span>
              <button onClick={() => setShowMore(false)} className="text-zinc-500">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.label} href={item.href} onClick={() => setShowMore(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                      isActive ? 'bg-pink-500/10 text-pink-400' : 'text-[var(--text-muted)] hover:bg-zinc-500/10'
                    )}>
                    <Icon size={18} />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </Link>
                );
              })}
              <button onClick={() => { toggleTheme(); setShowMore(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-muted)] hover:bg-zinc-500/10 transition-colors w-full">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-sm font-semibold">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors w-full">
                <LogOut size={18} />
                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--nav-bg)] backdrop-blur-lg border-t border-purple-500/20 px-1 py-2 z-50">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 transition-colors px-2 py-1 min-w-[56px]',
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

          {/* Desktop: show Hub, theme, logout inline */}
          <div className="hidden md:flex items-center gap-0">
            {moreItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 transition-colors px-2 py-1 min-w-[56px]',
                    isActive ? 'text-pink-400' : 'text-zinc-500 hover:text-purple-300'
                  )}>
                  <Icon size={18} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                </Link>
              );
            })}
            <button onClick={toggleTheme}
              className="flex flex-col items-center gap-1 text-zinc-500 hover:text-yellow-400 transition-colors px-2 py-1 min-w-[56px]">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span className="text-[9px] font-bold uppercase tracking-wider">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button onClick={handleLogout}
              className="flex flex-col items-center gap-1 text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 min-w-[56px]">
              <LogOut size={18} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Logout</span>
            </button>
          </div>

          {/* Mobile: single "More" button */}
          <button onClick={() => setShowMore(true)}
            className="flex md:hidden flex-col items-center gap-1 text-zinc-500 hover:text-purple-300 transition-colors px-2 py-1 min-w-[56px]">
            <MoreHorizontal size={18} />
            <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
