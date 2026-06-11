'use client';

import { useState } from 'react';
import { Coins, ExternalLink, CheckCircle2 } from 'lucide-react';
import AIFormLayout, { AIFormField, inputClassName } from './AIFormLayout';
import AIResultPanel from './AIResultPanel';
import { cn } from '@/lib/utils';

interface RoyaltyBodiesResult {
  country: string;
  summary: string;
  organizations: {
    name: string;
    collects: string;
    url: string;
    registrationSteps: string;
    priority: 'Essential' | 'Recommended' | 'Optional';
  }[];
  checklist: { step: string; description: string }[];
  notes: string;
  estimatedTimeline: string;
}

interface Props {
  defaultCountry?: string;
  defaultGenre?: string;
}

const priorityStyles = {
  Essential: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  Recommended: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  Optional: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
};

export default function RoyaltyBodiesGenerator({
  defaultCountry = '',
  defaultGenre = '',
}: Props) {
  const [country, setCountry] = useState(defaultCountry);
  const [genre, setGenre] = useState(defaultGenre);
  const [isWriter, setIsWriter] = useState(true);
  const [isPerformer, setIsPerformer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RoyaltyBodiesResult | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/royalty-bodies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, genre, isWriter, isPerformer }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setResult(data);
      setCheckedSteps(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <AIFormLayout
        title="AI Royalty Collection Advisor"
        description="Get recommendations for music business bodies to collect royalties in your country."
        icon={<Coins size={22} />}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Find Royalty Bodies"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIFormField label="Country *">
            <input className={inputClassName} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. United Kingdom, Nigeria, USA" required />
          </AIFormField>
          <AIFormField label="Genre">
            <input className={inputClassName} value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. Pop, Jazz" />
          </AIFormField>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input type="checkbox" checked={isWriter} onChange={(e) => setIsWriter(e.target.checked)} className="accent-pink-500" />
            I write my own music
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input type="checkbox" checked={isPerformer} onChange={(e) => setIsPerformer(e.target.checked)} className="accent-pink-500" />
            I perform / record music
          </label>
        </div>
      </AIFormLayout>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {result && (
        <AIResultPanel title={`Royalty Bodies for ${result.country}`}>
          <div className="space-y-8">
            <p className="text-zinc-300 text-sm leading-relaxed">{result.summary}</p>
            <p className="text-xs text-purple-400 font-semibold">Estimated timeline: {result.estimatedTimeline}</p>

            <div className="space-y-3">
              {result.organizations.map((org, i) => (
                <div key={i} className="bg-[#080814] border border-purple-500/20 rounded-xl overflow-hidden hover:border-pink-500/30 transition-colors">
                  <div className="px-5 py-3 border-b border-purple-500/10 flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{org.name}</h4>
                    <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border', priorityStyles[org.priority])}>
                      {org.priority}
                    </span>
                  </div>
                  <div className="px-5 py-4 space-y-2">
                    <p className="text-[10px] text-pink-400 font-black uppercase tracking-widest">{org.collects}</p>
                    <p className="text-xs text-zinc-400">{org.registrationSteps}</p>
                    {org.url && org.url !== '#' && (
                      <a href={org.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-pink-400 transition-colors">
                        Visit Website <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {result.checklist.length > 0 && (
              <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-5">
                <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2 mb-4">
                  <CheckCircle2 size={16} /> Registration Checklist
                </h4>
                <div className="space-y-3">
                  {result.checklist.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => setCheckedSteps((prev) => {
                        const next = new Set(prev);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      })}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <CheckCircle2
                        size={18}
                        className={cn('mt-0.5 flex-shrink-0', checkedSteps.has(i) ? 'text-pink-400' : 'text-purple-600 group-hover:text-purple-400')}
                      />
                      <div>
                        <p className={cn('text-sm font-medium', checkedSteps.has(i) ? 'text-zinc-500 line-through' : 'text-zinc-200')}>{item.step}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.notes && (
              <div className="text-xs text-zinc-500 border-t border-purple-500/20 pt-4">
                <span className="text-purple-400 font-semibold">Note: </span>{result.notes}
              </div>
            )}
          </div>
        </AIResultPanel>
      )}
    </div>
  );
}
