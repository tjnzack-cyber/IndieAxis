'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, ChevronLeft, Loader2, Check, Camera,
  Sparkles, Search, CheckCircle,
} from 'lucide-react';
import {
  JOURNEY_STAGES, CHALLENGES, GOALS_90_DAY,
  AFRICAN_COUNTRIES, COMMON_LANGUAGES, GENRE_SUGGESTIONS,
} from '@/lib/onboarding.config';

interface OnboardingData {
  onboardingStep: number;
  onboardingCompleted: boolean;
  name: string;
  profileImageUrl: string | null;
  country: string | null;
  genre: string | null;
  languages: string[];
  journeyStage: string | null;
  challenges: string[];
  goals90Day: string[];
}

interface EntitlementsData {
  tier: string;
}

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [name, setName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [country, setCountry] = useState('');
  const [genre, setGenre] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [journeyStage, setJourneyStage] = useState('');
  const [challenges, setChallenges] = useState<string[]>([]);
  const [goals90Day, setGoals90Day] = useState<string[]>([]);
  const [entitlements, setEntitlements] = useState<EntitlementsData | null>(null);

  // Load saved progress on mount — resumes at the right step
  useEffect(() => {
    fetch('/api/onboarding')
      .then(res => res.json())
      .then((data: OnboardingData) => {
        if (data.onboardingCompleted) {
          router.replace('/dashboard');
          return;
        }
        setName(data.name || '');
        setProfileImageUrl(data.profileImageUrl);
        setCountry(data.country || '');
        setGenre(data.genre || '');
        setLanguages(data.languages || []);
        setJourneyStage(data.journeyStage || '');
        setChallenges(data.challenges || []);
        setGoals90Day(data.goals90Day || []);
        // Resume at saved step, but never skip the welcome screen automatically
        setStep(data.onboardingStep > 0 ? data.onboardingStep : 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const saveStep = useCallback(async (stepNum: number, data: Record<string, any>, complete = false) => {
    setSaving(true);
    try {
      await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepNum, data, complete }),
      });
    } catch (err) {
      console.error('Failed to save onboarding step', err);
    } finally {
      setSaving(false);
    }
  }, []);

  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setStep(s => Math.max(s - 1, 1));

  const toggleInArray = (arr: string[], value: string, setter: (v: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  const uploadPhoto = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) setProfileImageUrl(data.url);
    } catch (err) {
      console.error('Photo upload failed', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Fetch plan status when reaching Step 6
  useEffect(() => {
    if (step === 6 && !entitlements) {
      fetch('/api/entitlements')
        .then(res => res.json())
        .then(data => setEntitlements(data?.error ? { tier: 'FREE' } : data))
        .catch(() => setEntitlements({ tier: 'FREE' }));
    }
  }, [step, entitlements]);

  const finishOnboarding = async () => {
    await saveStep(7, {}, true);
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b1a] flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b1a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Progress Bar — hidden on welcome and success screens */}
        {step > 1 && step < 7 && (
          <div className="flex gap-1.5 mb-8">
            {Array.from({ length: TOTAL_STEPS - 2 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i + 2 <= step ? 'bg-gradient-to-r from-[#6c5ce7] to-pink-500' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        )}

        {/* STEP 1 — Welcome */}
        {step === 1 && (
          <div className="text-center space-y-6 py-12">
            <div className="text-5xl mb-2">🎵</div>
            <h1 className="text-4xl font-black text-white">Welcome to IndieAxis.</h1>
            <p className="text-zinc-400 text-lg">Let's build your artist profile in under 2 minutes.</p>
            <button
              onClick={goNext}
              className="w-full py-4 bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white font-black rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              Get Started <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2 — Basic Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Tell us about you 🎤</h1>
              <p className="text-zinc-400">The basics — you can always edit these later.</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <label className="relative cursor-pointer group">
                <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-dashed border-purple-500/40 flex items-center justify-center overflow-hidden group-hover:border-pink-500 transition-colors">
                  {uploadingPhoto ? (
                    <Loader2 className="animate-spin text-pink-400" size={24} />
                  ) : profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-zinc-500" size={24} />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
                />
              </label>
              <span className="text-xs text-zinc-500">Add a profile photo (optional)</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Artist Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Zack Eli"
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 border border-purple-500/20 focus:border-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Country</label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 border border-purple-500/20 focus:border-pink-500 outline-none"
                >
                  <option value="">Select your country</option>
                  {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Primary Genre</label>
                <input
                  type="text"
                  list="genre-suggestions"
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                  placeholder="e.g. Afrobeats"
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 border border-purple-500/20 focus:border-pink-500 outline-none"
                />
                <datalist id="genre-suggestions">
                  {GENRE_SUGGESTIONS.map(g => <option key={g} value={g} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Languages You Perform In</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleInArray(languages, lang, setLanguages)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                        languages.includes(lang)
                          ? 'bg-pink-500 border-pink-500 text-white'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={goBack} className="px-6 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2">
                <ChevronLeft size={18} /> Back
              </button>
              <button
                onClick={async () => {
                  await saveStep(2, { name, profileImageUrl, country, genre, languages });
                  goNext();
                }}
                disabled={!name || !country || !genre || saving}
                className="flex-1 py-3 bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white font-black rounded-lg hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <>Next <ChevronRight size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Journey Stage */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Your journey 🌱</h1>
              <p className="text-zinc-400">Where are you currently in your music journey?</p>
            </div>
            <div className="space-y-3">
              {JOURNEY_STAGES.map(stage => (
                <button
                  key={stage.value}
                  onClick={() => setJourneyStage(stage.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    journeyStage === stage.value
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-2xl">{stage.emoji}</span>
                  <span className="font-semibold text-white">{stage.label}</span>
                  {journeyStage === stage.value && <Check className="ml-auto text-pink-400" size={18} />}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={goBack} className="px-6 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2">
                <ChevronLeft size={18} /> Back
              </button>
              <button
                onClick={async () => {
                  await saveStep(3, { journeyStage });
                  goNext();
                }}
                disabled={!journeyStage || saving}
                className="flex-1 py-3 bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white font-black rounded-lg hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <>Next <ChevronRight size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — Biggest Challenge */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Biggest challenge 💭</h1>
              <p className="text-zinc-400">What's holding you back right now? Pick all that apply.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CHALLENGES.map(c => (
                <button
                  key={c.value}
                  onClick={() => toggleInArray(challenges, c.value, setChallenges)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                    challenges.includes(c.value)
                      ? 'border-pink-500 bg-pink-500/10 text-white'
                      : 'border-zinc-800 bg-zinc-800/50 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={goBack} className="px-6 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2">
                <ChevronLeft size={18} /> Back
              </button>
              <button
                onClick={async () => {
                  await saveStep(4, { challenges });
                  goNext();
                }}
                disabled={challenges.length === 0 || saving}
                className="flex-1 py-3 bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white font-black rounded-lg hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <>Next <ChevronRight size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 — 90-Day Goals */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Your 90-day goals 🎯</h1>
              <p className="text-zinc-400">What would you like to achieve in the next 90 days?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GOALS_90_DAY.map(g => (
                <button
                  key={g.value}
                  onClick={() => toggleInArray(goals90Day, g.value, setGoals90Day)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                    goals90Day.includes(g.value)
                      ? 'border-pink-500 bg-pink-500/10 text-white'
                      : 'border-zinc-800 bg-zinc-800/50 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={goBack} className="px-6 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2">
                <ChevronLeft size={18} /> Back
              </button>
              <button
                onClick={async () => {
                  await saveStep(5, { goals90Day });
                  goNext();
                }}
                disabled={goals90Day.length === 0 || saving}
                className="flex-1 py-3 bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white font-black rounded-lg hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <>Next <ChevronRight size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6 — Subscription */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Choose your plan ✨</h1>
              <p className="text-zinc-400">You can always upgrade later — this won't hold you up.</p>
            </div>

            {!entitlements ? (
              <div className="flex items-center gap-3 p-6 bg-zinc-800 rounded-xl">
                <Loader2 className="animate-spin text-pink-400" size={18} />
                <span className="text-zinc-300 text-sm">Checking your plan status...</span>
              </div>
            ) : entitlements.tier !== 'FREE' ? (
              <div className="flex items-center gap-3 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                <CheckCircle className="text-green-400 flex-shrink-0" size={22} />
                <div>
                  <p className="font-bold text-white">You're already on a paid plan!</p>
                  <p className="text-sm text-zinc-400">Nothing more to do here — continue to your dashboard.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-5 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                  <p className="font-bold text-white mb-1">✨ EPK Pro — $4.99/mo</p>
                  <p className="text-sm text-zinc-400">Unlimited EPKs, custom branding, PDF export & QR codes.</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-[#6c5ce7]/20 to-pink-500/10 border border-pink-500/30 rounded-xl">
                  <p className="font-bold text-white mb-1">🚀 IndieAxis Pro — $12.99/mo</p>
                  <p className="text-sm text-zinc-400">Unlimited AI, releases, fan CRM, and advanced analytics.</p>
                </div>
                
                  href="/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-pink-400 text-sm font-semibold hover:text-pink-300 pt-1"
                >
                  View full plan comparison →
                </a>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={goBack} className="px-6 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2">
                <ChevronLeft size={18} /> Back
              </button>
              <button
                onClick={async () => {
                  await saveStep(6, {});
                  goNext();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white font-black rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7 — Success */}
        {step === 7 && (
          <div className="text-center space-y-6 py-8">
            <div className="text-5xl mb-2">🎉</div>
            <h1 className="text-3xl font-black text-white">You're all set!</h1>
            <p className="text-zinc-400">Your IndieAxis profile is ready, {name || 'artist'}.</p>

            <div className="text-left space-y-2 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <ChecklistItem label="Complete Profile" done />
              <ChecklistItem label="Upload First Song" />
              <ChecklistItem label="Connect Social Media" />
              <ChecklistItem label="Explore Opportunities" />
              <ChecklistItem label="Discover Your Stats" icon={<Search size={16} className="text-pink-400" />} />
            </div>

            <button
              onClick={finishOnboarding}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white font-black rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <>Launch My Dashboard <Sparkles size={18} /></>}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

function ChecklistItem({ label, done, icon }: { label: string; done?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {done ? (
        <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
      ) : icon ? (
        icon
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-zinc-600 flex-shrink-0" />
      )}
      <span className={done ? 'text-zinc-300' : 'text-zinc-400'}>{label}</span>
    </div>
  );
}
