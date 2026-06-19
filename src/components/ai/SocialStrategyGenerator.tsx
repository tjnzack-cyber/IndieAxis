'use client';

import { useState } from 'react';
import { Share2, Hash, Calendar } from 'lucide-react';
import AIFormLayout, { AIFormField, inputClassName, textareaClassName } from './AIFormLayout';
import AIResultPanel from './AIResultPanel';
import TypewriterText from './TypewriterText';
import { cn } from '@/lib/utils';

interface SocialStrategyResult {
  overview: string;
  platforms: {
    name: string;
    strategy: string;
    contentIdeas: string[];
    postingFrequency: string;
    bestPractices: string[];
  }[];
  hashtagStrategy: string[];
  engagementTips: string[];
  contentCalendar: { week: number; focus: string; actions: string[] }[];
}

interface Props {
  defaultGenre?: string;
  defaultLocation?: string;
  defaultName?: string;
}

const platformColors: Record<string, string> = {
  Instagram: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  TikTok: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  YouTube: 'bg-red-500/10 text-red-400 border-red-500/20',
  Twitter: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  X: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const THINKING_MESSAGES = [
  'Studying your genre & audience…',
  'Scouting platform trends…',
  'Drafting content pillars…',
  'Building your 4-week calendar…',
  'Polishing hashtag strategy…',
];

export default function SocialStrategyGenerator({
  defaultGenre = '',
  defaultLocation = '',
  defaultName = '',
}: Props) {
  const [genre, setGenre] = useState(defaultGenre);
  const [targetAudience, setTargetAudience] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [platforms, setPlatforms] = useState('Instagram, TikTok, YouTube');
  const [artistName, setArtistName] = useState(defaultName);
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SocialStrategyResult | null>(null);
  const [overviewDone, setOverviewDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOverviewDone(false);

    try {
      const res = await fetch('/api/ai/social-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, targetAudience, location, platforms, artistName, goals }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <AIFormLayout
        title="AI Social Media Strategy"
        description="Get tailored social media strategies for indie artists based on genre and target audience."
        icon={<Share2 size={22} />}
        onSubmit={handleSubmit}
        loading={loading}
        thinkingMessages={THINKING_MESSAGES}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIFormField label="Artist Name">
            <input className={inputClassName} value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="Your name" />
          </AIFormField>
          <AIFormField label="Genre *">
            <input className={inputClassName} value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. R&B, Folk" required />
          </AIFormField>
          <AIFormField label="Location">
            <input className={inputClassName} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
          </AIFormField>
          <AIFormField label="Platforms">
            <input className={inputClassName} value={platforms} onChange={(e) => setPlatforms(e.target.value)} placeholder="Instagram, TikTok, YouTube" />
          </AIFormField>
        </div>
        <AIFormField label="Target Audience *" hint="Who are you trying to reach? Age, interests, music taste">
          <textarea className={textareaClassName} rows={3} value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g. 18-30 year olds who love lo-fi beats and study playlists" required />
        </AIFormField>
        <AIFormField label="Social Media Goals">
          <textarea className={textareaClassName} rows={2} value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="e.g. Grow to 10k followers, drive Spotify streams" />
        </AIFormField>
      </AIFormLayout>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {result && (
        <AIResultPanel title="Your Social Media Strategy">
          <div className="space-y-8">
            <p className="text-zinc-300 leading-relaxed min-h-[1.5em]">
              <TypewriterText text={result.overview} speed={14} charsPerTick={2} onComplete={() => setOverviewDone(true)} />
            </p>

            {/* Rest of the result renders normally once the overview has finished typing,
                so the page doesn't feel like it's withholding content unnecessarily */}
            <div className={cn('space-y-8 transition-opacity duration-500', overviewDone ? 'opacity-100' : 'opacity-0')}>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest">Platform Strategies</h4>
                {result.platforms.map((platform, i) => (
                  <div key={i} className="bg-[#080814] border border-purple-500/20 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <span className={cn('text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full border', platformColors[platform.name] || 'bg-purple-500/10 text-purple-300 border-purple-500/20')}>
                        {platform.name}
                      </span>
                      <span className="text-xs text-zinc-500">{platform.postingFrequency}</span>
                    </div>
                    <p className="text-sm text-zinc-300 mb-3">{platform.strategy}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-2">Content Ideas</p>
                        <ul className="space-y-1">
                          {platform.contentIdeas.map((idea, j) => (
                            <li key={j} className="text-xs text-zinc-400">• {idea}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Best Practices</p>
                        <ul className="space-y-1">
                          {platform.bestPractices.map((tip, j) => (
                            <li key={j} className="text-xs text-zinc-400">• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {result.hashtagStrategy.length > 0 && (
                <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2 mb-3">
                    <Hash size={14} /> Hashtag Strategy
                  </h4>
                  <ul className="space-y-1">
                    {result.hashtagStrategy.map((h, i) => (
                      <li key={i} className="text-sm text-zinc-400">{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.contentCalendar.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar size={14} /> 4-Week Content Calendar
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.contentCalendar.map((week, i) => (
                      <div key={i} className="bg-[#080814] border border-pink-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-black text-pink-400">WEEK {week.week}</span>
                          <span className="text-sm font-semibold text-white">{week.focus}</span>
                        </div>
                        <ul className="space-y-1">
                          {week.actions.map((action, j) => (
                            <li key={j} className="text-xs text-zinc-400">• {action}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.engagementTips.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-3">Engagement Tips</h4>
                  <ul className="space-y-2">
                    {result.engagementTips.map((tip, i) => (
                      <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                        <span className="text-pink-400 mt-0.5">→</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </AIResultPanel>
      )}
    </div>
  );
}
