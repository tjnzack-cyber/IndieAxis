'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ChevronRight, 
  Music, 
  MapPin, 
  BarChart3, 
  Rocket, 
  CheckCircle2, 
  Sparkles,
  Guitar,
  TrendingUp,
  CircleDollarSign,
  Mail,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    genre: 'Afrobeat',
    location: '',
    listeners: '0 - 500',
    goal: 'Release my first single'
  });
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && step === 1) {
      setStep(2);
    }
  }, [status, step]);

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      // Create user first
      const email = session?.user?.email; 
      const onboardRes = await fetch('/api/auth/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          genre: formData.genre,
          location: formData.location
        })
      });
      const onboardData = await onboardRes.json();
      
      // Now start trial
      if (onboardData.user) {
        await fetch('/api/trial/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: onboardData.user.id })
        });
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to start trial:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipTrial = async () => {
    setLoading(true);
    try {
      const email = session?.user?.email; 
      await fetch('/api/auth/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          genre: formData.genre,
          location: formData.location
        })
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to skip trial:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const genres = ['Afrobeat', 'Hip-Hop', 'Indie Pop', 'R&B', 'Electronic', 'Alternative'];
  const listenerRanges = ['0 - 500', '500 - 5,000', '5,000 - 20,000', '20,000+'];
  const goals = [
    { id: 'Release my first single', icon: <Rocket size={24} />, text: 'Release my first single' },
    { id: 'Book more local gigs', icon: <Guitar size={24} />, text: 'Book more local gigs' },
    { id: 'Grow my social following', icon: <TrendingUp size={24} />, text: 'Grow my social following' },
    { id: 'Secure funding/grants', icon: <CircleDollarSign size={24} />, text: 'Secure funding/grants' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white flex flex-col items-center justify-center p-6 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="w-full max-w-md bg-[#1a1a2e] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl flex flex-col relative aspect-[9/19] max-h-[812px]">
        
        {/* Step 1: Welcome */}
        <div className={cn("flex-1 flex flex-col p-8 transition-all duration-500", step === 1 ? "opacity-100 translate-x-0" : "opacity-0 absolute inset-0 pointer-events-none -translate-x-full")}>
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-cyan-400 rounded-3xl flex items-center justify-center text-3xl font-black shadow-2xl shadow-indigo-600/40">
              IA
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-cyan-400">Welcome to IndieAxis</h1>
              <p className="text-zinc-400 text-lg leading-relaxed px-4">
                The mini-manager in your pocket. Let's build your strategy.
              </p>
            </div>
          </div>
          <div className="space-y-4 pb-8">
            <button 
              onClick={nextStep}
              className="w-full flex items-center justify-center gap-3 bg-white text-black h-16 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
            >
              <div className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-[10px]">G</div>
              Continue with Google
            </button>
            <button 
              onClick={nextStep}
              className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 h-16 rounded-2xl font-bold hover:bg-white/10 transition-colors"
            >
              <Mail size={20} />
              Create Account
            </button>
            <div className="text-center pt-4">
              <button 
                onClick={() => router.push('/login')}
                className="text-zinc-500 text-sm font-medium hover:text-cyan-400 transition-colors"
              >
                Already have an account? <span className="text-cyan-400 font-bold">Log In</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Profile */}
        <div className={cn("flex-1 flex flex-col p-8 transition-all duration-500", step === 2 ? "opacity-100 translate-x-0" : "opacity-0 absolute inset-0 pointer-events-none translate-x-full")}>
          <Progress step={1} />
          <div className="flex-1 space-y-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-cyan-400">About Your Music</h2>
              <p className="text-zinc-400">Help us personalize your dashboard.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                  <Music size={12} />
                  Primary Genre
                </label>
                <div className="flex flex-wrap gap-2">
                  {genres.map(g => (
                    <button
                      key={g}
                      onClick={() => setFormData({ ...formData, genre: g })}
                      className={cn(
                        "px-4 py-2.5 rounded-full text-sm font-bold border transition-all",
                        formData.genre === g 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30" 
                          : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                  <MapPin size={12} />
                  Where are you based?
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. London, UK"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400/50 transition-colors"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                  <BarChart3 size={12} />
                  Monthly Listeners
                </label>
                <select 
                  value={formData.listeners}
                  onChange={(e) => setFormData({ ...formData, listeners: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-5 text-white focus:outline-none focus:border-cyan-400/50 transition-colors appearance-none"
                >
                  {listenerRanges.map(r => <option key={r} value={r} className="bg-[#1a1a2e]">{r}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="pt-8 pb-8">
            <button 
              onClick={nextStep}
              className="w-full bg-indigo-600 h-16 rounded-2xl font-black text-lg hover:bg-indigo-500 transition-colors shadow-xl shadow-indigo-600/30"
            >
              Next
            </button>
          </div>
        </div>

        {/* Step 3: Goals */}
        <div className={cn("flex-1 flex flex-col p-8 transition-all duration-500", step === 3 ? "opacity-100 translate-x-0" : "opacity-0 absolute inset-0 pointer-events-none translate-x-full")}>
          <Progress step={2} />
          <div className="flex-1 space-y-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-cyan-400">What's your goal?</h2>
              <p className="text-zinc-400">Pick one to focus your strategy.</p>
            </div>

            <div className="space-y-4">
              {goals.map(g => (
                <button
                  key={g.id}
                  onClick={() => setFormData({ ...formData, goal: g.id })}
                  className={cn(
                    "w-full flex items-center gap-5 p-5 rounded-3xl border transition-all text-left",
                    formData.goal === g.id 
                      ? "bg-cyan-400/5 border-cyan-400/50" 
                      : "bg-white/5 border-white/5 hover:border-white/20"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    formData.goal === g.id ? "bg-cyan-400 text-[#0b0b1a]" : "bg-[#0b0b1a] text-zinc-500"
                  )}>
                    {g.icon}
                  </div>
                  <span className={cn("font-bold text-lg", formData.goal === g.id ? "text-white" : "text-zinc-400")}>
                    {g.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="pt-8 pb-8">
            <button 
              onClick={nextStep}
              className="w-full bg-indigo-600 h-16 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-colors shadow-xl shadow-indigo-600/30"
            >
              Build My Plan
            </button>
          </div>
        </div>

        {/* Step 4: Success */}
        <div className={cn("flex-1 flex flex-col p-8 transition-all duration-500", step === 4 ? "opacity-100 translate-x-0" : "opacity-0 absolute inset-0 pointer-events-none translate-x-full")}>
          <Progress step={3} />
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10">
            <div className="w-24 h-24 bg-cyan-400/10 rounded-full flex items-center justify-center text-5xl animate-pulse">
              ✨
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-cyan-400">Strategy Ready!</h2>
              <p className="text-zinc-400 text-lg">
                Based on your goals, we've built your first marketing roadmap.
              </p>
            </div>

            <div className="w-full p-6 bg-white/5 border border-white/10 rounded-[32px] text-left relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-400" />
              <div className="space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">First Task</div>
                <h3 className="text-xl font-bold">Register with your local PRO</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Secure your performance royalties before your release.
                </p>
              </div>
              <div className="absolute top-6 right-6 text-zinc-800">
                <CheckCircle2 size={32} />
              </div>
            </div>
          </div>
          <div className="pt-8 pb-8 space-y-4">
            <button 
              onClick={handleStartTrial}
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-3 bg-[#6c5ce7] h-16 rounded-2xl font-black text-white text-lg hover:bg-[#5b4bc4] transition-all shadow-xl shadow-[#6c5ce7]/30 animate-pulse",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? 'Building Strategy...' : 'Start My 7-Day Free Trial'}
              {!loading && <ArrowRight size={20} />}
            </button>
            <button 
              onClick={handleSkipTrial}
              disabled={loading}
              className="w-full text-zinc-500 font-bold hover:text-white transition-colors"
            >
              Maybe later, take me to dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="w-full h-1 bg-white/5 rounded-full mb-12 overflow-hidden">
      <div 
        className="h-full bg-cyan-400 transition-all duration-500" 
        style={{ width: `${(step / 3) * 100}%` }}
      />
    </div>
  );
}
