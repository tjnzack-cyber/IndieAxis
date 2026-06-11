'use client';

import { useState } from 'react';
import { Music, MapPin, Star, Calendar, ChevronRight } from 'lucide-react';
import AIFormLayout, { AIFormField, inputClassName } from './AIFormLayout';
import AIResultPanel from './AIResultPanel';

interface GigOpportunitiesResult {
  gigs: {
    title: string;
    location: string;
    venueType: string;
    description: string;
    matchScore: number;
    gigDate: string;
    pitchDeadline: string;
    howToApply: string;
  }[];
  pitchingWindows: {
    month: string;
    title: string;
    deadline: string;
    description: string;
    category: string;
  }[];
  localTips: string[];
  networkingSuggestions: string[];
}

interface Props {
  defaultLocation?: string;
  defaultGenre?: string;
  defaultName?: string;
}

export default function GigOpportunitiesGenerator({
  defaultLocation = '',
  defaultGenre = '',
  defaultName = '',
}: Props) {
  const [location, setLocation] = useState(defaultLocation);
  const [genre, setGenre] = useState(defaultGenre);
  const [artistName, setArtistName] = useState(defaultName);
  const [experienceLevel, setExperienceLevel] = useState('Emerging');
  const [willingToTravel, setWillingToTravel] = useState('Within my region');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GigOpportunitiesResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/gig-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, genre, artistName, experienceLevel, willingToTravel }),
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
        title="AI Gig & Pitching Finder"
        description="Discover gig opportunities and pitching windows tailored to your location and genre."
        icon={<Music size={22} />}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Find Opportunities"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIFormField label="Artist Name">
            <input className={inputClassName} value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="Your name" />
          </AIFormField>
          <AIFormField label="Genre *">
            <input className={inputClassName} value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. Indie Rock" required />
          </AIFormField>
          <AIFormField label="Location *">
            <input className={inputClassName} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Manchester, UK" required />
          </AIFormField>
          <AIFormField label="Experience Level">
            <select className={inputClassName} value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
              <option value="Emerging">Emerging</option>
              <option value="Developing">Developing</option>
              <option value="Established">Established</option>
            </select>
          </AIFormField>
        </div>
        <AIFormField label="Travel Willingness">
          <select className={inputClassName} value={willingToTravel} onChange={(e) => setWillingToTravel(e.target.value)}>
            <option value="Local only">Local only</option>
            <option value="Within my region">Within my region</option>
            <option value="National">National</option>
            <option value="International">International</option>
          </select>
        </AIFormField>
      </AIFormLayout>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {result && (
        <div className="space-y-8">
          <AIResultPanel title="Gig Matches">
            <div className="space-y-4">
              {result.gigs.map((gig, i) => (
                <div key={i} className="bg-[#080814] border border-purple-500/20 rounded-xl p-5 hover:border-pink-500/30 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                    <div>
                      <h4 className="font-bold text-white">{gig.title}</h4>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-purple-400" />
                        {gig.location} • {gig.venueType}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> {gig.matchScore}% Match
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{gig.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <p className="text-zinc-500"><span className="text-purple-400 font-semibold">Date:</span> {gig.gigDate}</p>
                    <p className="text-zinc-500"><span className="text-purple-400 font-semibold">Apply by:</span> {gig.pitchDeadline}</p>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2 border-t border-purple-500/10 pt-2">
                    <span className="text-pink-400 font-semibold">How to apply:</span> {gig.howToApply}
                  </p>
                </div>
              ))}
            </div>
          </AIResultPanel>

          <AIResultPanel title="Pitching Windows">
            <div className="space-y-1">
              {result.pitchingWindows.map((window, i) => (
                <div key={i} className="flex items-center gap-4 py-4 border-b border-purple-500/10 last:border-0 group hover:bg-purple-900/10 px-2 rounded-lg transition-colors">
                  <div className="w-10 text-pink-400 font-black text-xs tracking-tighter">{window.month}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-zinc-200">{window.title}</h4>
                      <span className="text-[10px] text-purple-400 font-bold uppercase">{window.category}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">{window.deadline}</p>
                    <p className="text-xs text-zinc-500 mt-1">{window.description}</p>
                  </div>
                  <ChevronRight size={14} className="text-purple-600 group-hover:text-pink-400 transition-colors" />
                </div>
              ))}
            </div>
          </AIResultPanel>

          {(result.localTips.length > 0 || result.networkingSuggestions.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.localTips.length > 0 && (
                <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2 mb-3">
                    <Calendar size={14} /> Local Tips
                  </h4>
                  <ul className="space-y-2">
                    {result.localTips.map((tip, i) => (
                      <li key={i} className="text-xs text-zinc-400">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.networkingSuggestions.length > 0 && (
                <div className="bg-pink-900/20 border border-pink-500/20 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-pink-300 mb-3">Networking</h4>
                  <ul className="space-y-2">
                    {result.networkingSuggestions.map((s, i) => (
                      <li key={i} className="text-xs text-zinc-400">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
