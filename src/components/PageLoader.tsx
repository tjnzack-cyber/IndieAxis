'use client';
import { Music2 } from 'lucide-react';

interface Props {
  /** Optional custom message; defaults to a rotating-feel single line */
  message?: string;
  variant?: 'fullscreen' | 'inline';
}

/**
 * Branded loading state for page/dashboard transitions.
 * Use 'fullscreen' for initial page loads (login -> dashboard),
 * use 'inline' for loading states inside an already-visible layout.
 */
export default function PageLoader({ message = 'Loading your dashboard…', variant = 'fullscreen' }: Props) {
  if (variant === 'inline') {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <LogoPulse />
        <p className="text-zinc-500 text-sm animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b1a] flex flex-col items-center justify-center gap-4">
      <LogoPulse />
      <p className="text-zinc-400 text-sm animate-pulse">{message}</p>
    </div>
  );
}

function LogoPulse() {
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6c5ce7] to-pink-500 blur-xl opacity-40 animate-pulse" />
      <div className="relative w-14 h-14 rounded-full bg-gradient-to-r from-[#6c5ce7] to-pink-500 flex items-center justify-center animate-[spin_2.4s_linear_infinite]">
        <Music2 size={22} className="text-white" />
      </div>
    </div>
  );
}

/** Skeleton block for cards/sections while real content streams in */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-zinc-800/50 dark:bg-zinc-800/50 rounded-xl p-4 animate-pulse ${className}`}>
      <div className="h-3 bg-zinc-700 rounded w-1/3 mb-3" />
      <div className="h-6 bg-zinc-700 rounded w-2/3" />
    </div>
  );
}

/** Grid of skeleton stat cards — mirrors the 3-stat layout on the dashboard */
export function SkeletonStatsRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard className="col-span-2 md:col-span-1" />
    </div>
  );
}
