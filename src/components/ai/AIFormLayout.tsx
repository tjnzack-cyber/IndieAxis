'use client';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

interface Props {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
  /** Rotating status lines shown while the AI is "thinking".
   *  Pass custom ones per-generator, or omit to use the defaults. */
  thinkingMessages?: string[];
}

const DEFAULT_THINKING_MESSAGES = [
  'Reading your details…',
  'Researching your genre…',
  'Mapping out the strategy…',
  'Polishing the details…',
  'Almost ready…',
];

export default function AIFormLayout({
  title,
  description,
  icon,
  children,
  onSubmit,
  loading = false,
  submitLabel = 'Generate with AI',
  thinkingMessages = DEFAULT_THINKING_MESSAGES,
}: Props) {
  const [msgIndex, setMsgIndex] = useState(0);

  // Cycle through thinking messages while loading
  useEffect(() => {
    if (!loading) { setMsgIndex(0); return; }
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % thinkingMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading, thinkingMessages.length]);

  return (
    <div className="bg-[#0b0b1a] border border-purple-500/20 rounded-2xl overflow-hidden shadow-xl shadow-purple-900/10">
      <div className="bg-gradient-to-r from-purple-900/40 via-[#6c5ce7]/20 to-pink-900/30 px-6 py-5 border-b border-purple-500/20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-400/30 text-pink-400 flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">{title}</h2>
            <p className="text-sm text-zinc-400 mt-0.5">{description}</p>
          </div>
        </div>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-5">
        <fieldset disabled={loading} className={cn('space-y-5 transition-opacity', loading && 'opacity-50')}>
          {children}
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all relative overflow-hidden',
            loading
              ? 'bg-purple-900/50 text-purple-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white hover:from-purple-500 hover:to-pink-400 shadow-lg shadow-purple-500/25 active:scale-[0.98]'
          )}
        >
          {loading ? (
            <>
              {/* Shimmer sweep across the button while generating */}
              <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <Loader2 size={18} className="animate-spin flex-shrink-0" />
              <span className="truncate">{thinkingMessages[msgIndex]}</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              {submitLabel}
            </>
          )}
        </button>
      </form>

      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export function AIFormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2 min-w-0">
      <label className="text-sm font-semibold text-purple-200">{label}</label>
      {children}
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export const inputClassName =
  'w-full px-4 py-3 bg-[#080814] border border-purple-500/20 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-colors';
export const textareaClassName =
  'w-full px-4 py-3 bg-[#080814] border border-purple-500/20 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-colors resize-none';
