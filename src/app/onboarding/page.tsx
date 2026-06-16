'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Music, MapPin, Target, ChevronRight, ChevronLeft } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    genre: '',
    location: '',
    careerStage: 'Emerging (0-2 years)',
    goals: '',
    spotifyListeners: '',
    instagramFollowers: '',
    tiktokFollowers: '',
    youtubeSubscribers: '',
    soundcloudPlays: '',
  });

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleFinish = async () => {
    setLoading(true);
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        genre: form.genre,
        location: form.location,
        bio: `Career Stage: ${form.careerStage}. Goals: ${form.goals}`,
        socialLinks: {
          spotifyListeners: form.spotifyListeners,
          instagramFollowers: form.instagramFollowers,
          tiktokFollowers: form.tiktokFollowers,
          youtubeSubscribers: form.youtubeSubscribers,
          soundcloudPlays: form.soundcloudPlays,
        },
      }),
    });
    setLoading(false);
    router.push('/dashboard/marketing');
  };

  return (
    <div className="min-h-screen bg-[#0b0b1a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-gradient-to-r from-[#6c5ce7] to-pink-500' : 'bg-zinc-800'}`} />
          ))}
        </div>

        {/* Step 1 — Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Welcome to IndieAxis! 🎵</h1>
              <p className="text-zinc-400">Let's set up your artist profile. This takes 2 minutes.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Your Artist Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="e.g. Zack Eli"
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 border border-purple-500/20 focus:border-pink-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Your Genre(s)</label>
                <input
                  type="text"
                  value={form.genre}
                  onChange={e => update('genre', e.target.value)}
                  placeholder="e.g. RnB, Soul, Afro-Pop"
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 border border-purple-500/20 focus:border-pink-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Your Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => update('location', e.target.value)}
                  placeholder="e.g. Lusaka, Zambia"
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 border border-purple-500/20 focus:border-pink-500 outline-none"
                />
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!form.name || !form.genre || !form.location}
              className="w-full py-3 bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white font-black rounded-lg hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2 — Career Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Your Career 🚀</h1>
              <p className="text-zinc-400">Tell us where you are and where you want to go.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Career Stage</label>
                <select
                  value={form.careerStage}
                  onChange={e => update('careerStage', e.target.value)}
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 border border-purple-500/20 focus:border-pink-500 outline-none"
                >
                  <option>Emerging (0-2 years)</option>
                  <option>Developing (2-5 years)</option>
                  <option>Established (5+ years)</option>
                  <option>Professional (Full-time artist)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Your Main Goals</label>
                <textarea
                  value={form.goals}
                  onChange={e => update('goals', e.target.value)}
                  rows={3}
                  placeholder="e.g. Gain 5K Spotify listeners, book 2 gigs per month, get playlist features"
                  className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 border border-purple-500/20 focus:border-pink-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.goals}
                className="flex-1 py-3 bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white font-black rounded-lg hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Streaming Stats */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Your Numbers 📊</h1>
              <p className="text-zinc-400">Add your current stats so we can personalize your strategy. All optional.</p>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Spotify Monthly Listeners', field: 'spotifyListeners', placeholder: 'e.g. 1200' },
                { label: 'Instagram Followers', field: 'instagramFollowers', placeholder: 'e.g. 3500' },
                { label: 'TikTok Followers', field: 'tiktokFollowers', placeholder: 'e.g. 800' },
                { label: 'YouTube Subscribers', field: 'youtubeSubscribers', placeholder: 'e.g. 450' },
                { label: 'SoundCloud Plays', field: 'soundcloudPlays', placeholder: 'e.g. 2000' },
              ].map(item => (
                <div key={item.field}>
                  <label className="block text-sm font-bold text-zinc-400 mb-2">{item.label}</label>
                  <input
                    type="number"
                    value={form[item.field as keyof typeof form]}
                    onChange={e => update(item.field, e.target.value)}
                    placeholder={item.placeholder}
                    className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 border border-purple-500/20 focus:border-pink-500 outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-lg hover:bg-zinc-700 transition-all flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white font-black rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Setting up...' : 'Launch My Dashboard 🚀'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
