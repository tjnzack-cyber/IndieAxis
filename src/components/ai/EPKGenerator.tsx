'use client';

import { useState } from 'react';
import { FileText, Quote, Mail, Star } from 'lucide-react';
import AIFormLayout, { AIFormField, inputClassName, textareaClassName } from './AIFormLayout';
import AIResultPanel from './AIResultPanel';
import TypewriterText from './TypewriterText';
import { cn } from '@/lib/utils';

interface EPKResult {
  headline: string;
  bio: string;
  genreDescription: string;
  achievements: string[];
  pressQuotes: { text: string; source: string }[];
  contactSection: {
    bookingEmail: string;
    pressContact: string;
    socialHandles: string;
  };
  oneLiner: string;
  highlights: string[];
}

interface Props {
  defaultName?: string;
  defaultBio?: string;
  defaultGenre?: string;
  defaultLocation?: string;
}

const THINKING_MESSAGES = [
  'Reading your bio & achievements…',
  'Crafting your headline…',
  'Writing your press bio…',
  'Formatting press quotes…',
  'Finalising your EPK…',
];

export default function EPKGenerator({
  defaultName = '',
  defaultBio = '',
  defaultGenre = '',
  defaultLocation = '',
}: Props) {
  const [name, setName] = useState(defaultName);
  const [bio, setBio] = useState(defaultBio);
  const [genre, setGenre] = useState(defaultGenre);
  const [location, setLocation] = useState(defaultLocation);
  const [achievements, setAchievements] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EPKResult | null>(null);
  const [bioDone, setBioDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBioDone(false);

    try {
      const res = await fetch('/api/ai/epk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, genre, location, achievements, contactEmail, socialLinks }),
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
        title="AI Electronic Press Kit Builder"
        description="Generate a professional EPK from your profile — bio, achievements, press quotes, and contact details."
        icon={<FileText size={22} />}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Build My EPK"
        thinkingMessages={THINKING_MESSAGES}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIFormField label="Artist Name *">
            <input className={inputClassName} value={name} onChange={(e) => setName(e.target.value)} placeholder="Stage name" required />
          </AIFormField>
          <AIFormField label="Genre *">
            <input className={inputClassName} value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. Soul, Hip-Hop" required />
          </AIFormField>
          <AIFormField label="Location">
            <input className={inputClassName} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
          </AIFormField>
          <AIFormField label="Contact Email">
            <input className={inputClassName} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="booking@yourname.com" />
          </AIFormField>
        </div>
        <AIFormField label="Bio">
          <textarea className={textareaClassName} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself and your music..." />
        </AIFormField>
        <AIFormField label="Achievements & Highlights">
          <textarea className={textareaClassName} rows={3} value={achievements} onChange={(e) => setAchievements(e.target.value)} placeholder="Releases, performances, press features, awards..." />
        </AIFormField>
        <AIFormField label="Social Media Links">
          <input className={inputClassName} value={socialLinks} onChange={(e) => setSocialLinks(e.target.value)} placeholder="Instagram, Spotify, TikTok URLs" />
        </AIFormField>
      </AIFormLayout>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {result && (
        <AIResultPanel title="Your Electronic Press Kit">
          <div className="space-y-8">
            <div className="text-center py-6 border-b border-purple-500/20">
              <p className="text-pink-400 text-sm font-bold uppercase tracking-widest mb-2">{result.oneLiner}</p>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">{result.headline}</h3>
              <p className="text-purple-300 mt-2 text-sm">{result.genreDescription}</p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-3 border-b border-purple-500/20 pb-2">About</h4>
              <div className="text-zinc-300 leading-relaxed whitespace-pre-line text-sm min-h-[1.5em]">
                <TypewriterText text={result.bio} speed={12} charsPerTick={2} onComplete={() => setBioDone(true)} />
              </div>
            </div>

            <div className={cn('space-y-8 transition-opacity duration-500', bioDone ? 'opacity-100' : 'opacity-0')}>
              {result.highlights.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Star size={14} className="text-pink-400" /> Highlights
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.highlights.map((h, i) => (
                      <li key={i} className="text-sm text-zinc-300 bg-purple-900/20 border border-purple-500/20 rounded-lg px-4 py-2">{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.achievements.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-3">Achievements</h4>
                  <ul className="space-y-2">
                    {result.achievements.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <span className="text-pink-400">✦</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.pressQuotes.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Quote size={14} /> Press
                  </h4>
                  <div className="space-y-4">
                    {result.pressQuotes.map((q, i) => (
                      <blockquote key={i} className="border-l-4 border-pink-500 pl-6 py-2">
                        <p className="text-zinc-200 italic text-sm">&ldquo;{q.text}&rdquo;</p>
                        <cite className="text-pink-400 text-xs font-bold uppercase tracking-wider not-italic mt-2 block">— {q.source}</cite>
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/20 rounded-xl p-6">
                <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Mail size={14} /> Contact
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-zinc-300"><span className="text-purple-400 font-semibold">Booking:</span> {result.contactSection.bookingEmail}</p>
                  <p className="text-zinc-300"><span className="text-purple-400 font-semibold">Press:</span> {result.contactSection.pressContact}</p>
                  <p className="text-zinc-300"><span className="text-purple-400 font-semibold">Social:</span> {result.contactSection.socialHandles}</p>
                </div>
              </div>
            </div>
          </div>
        </AIResultPanel>
      )}
    </div>
  );
}
