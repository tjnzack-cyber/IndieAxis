'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, Music, FileText, Sparkles, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Home', icon: Home, href: '/dashboard/profile' },
    { label: 'Strategy', icon: Calendar, href: '/dashboard/marketing' },
    { label: 'Gigs', icon: Music, href: '/dashboard/opportunities' },
    { label: 'EPK', icon: FileText, href: '/dashboard/epk' },
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
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0b0b1a]/95 backdrop-blur-lg border-t border-purple-500/20 px-2 py-3 z-50">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 transition-colors px-2',
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
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-zinc-500 hover:text-red-400 transition-colors px-2"
          >
            <LogOut size={18} />
            <span className="text-[9px] font-bold uppercase tracking-wider">
              Logout
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
