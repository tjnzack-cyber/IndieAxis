'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Rocket, FileText, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const startTrial = async () => {
    if (!user) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/trial/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
        setModalOpen(null);
        // Refresh local state
        setUser({ ...user, subscriptionStatus: 'PREMIUM', trialUsed: true });
      } else {
        alert(data.error || 'Failed to start trial');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const initiatePayment = async (planId: string) => {
    if (!user) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/pesapal/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userId: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
        }),
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert('Failed to initiate payment');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0f0c29] bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <div className="text-4xl font-black mb-4 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] bg-clip-text text-transparent inline-block">
            IndieAxis
          </div>
          <h1 className="text-5xl font-bold mb-4">Empower Your Music Career</h1>
          <p className="text-xl text-zinc-400">Choose the plan that fits your journey to stardom.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Free Tier */}
          <div className="bg-[#1a1a2e] rounded-[20px] p-10 border border-white/10 flex flex-col text-center hover:-translate-y-2 transition-all duration-300">
            <div className="text-2xl font-bold mb-2">Free</div>
            <div className="text-5xl font-bold my-6">$0<span className="text-lg text-zinc-400 font-normal">/forever</span></div>
            <ul className="text-left space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-zinc-300"><Check className="text-[#00cec9]" size={20} /> Basic Marketing Tips</li>
              <li className="flex items-center gap-3 text-zinc-300"><Check className="text-[#00cec9]" size={20} /> Social Media Suggestions</li>
              <li className="flex items-center gap-3 text-zinc-300"><Check className="text-[#00cec9]" size={20} /> Royalty Body Links</li>
              <li className="flex items-center gap-3 text-zinc-500 line-through"><X size={20} /> AI Marketing Plans</li>
              <li className="flex items-center gap-3 text-zinc-500 line-through"><X size={20} /> Professional EPK Builder</li>
              <li className="flex items-center gap-3 text-zinc-500 line-through"><X size={20} /> Gig Connections</li>
            </ul>
            <button className="w-full py-4 rounded-full border-2 border-[#6c5ce7] text-[#6c5ce7] font-bold hover:bg-[#6c5ce7] hover:text-white transition-colors">
              {user?.subscriptionStatus === 'FREE' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-[#1a1a2e] rounded-[20px] p-10 border-2 border-[#6c5ce7] flex flex-col text-center scale-105 relative z-10 hover:-translate-y-2 transition-all duration-300 shadow-2xl shadow-[#6c5ce7]/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#6c5ce7] text-white px-5 py-1 rounded-full text-sm font-black uppercase tracking-widest">
              Most Popular
            </div>
            <div className="text-2xl font-bold mb-2">Premium</div>
            <div className="text-5xl font-bold my-6">$5<span className="text-lg text-zinc-400 font-normal">/month</span></div>
            <p className="text-[#00cec9] font-bold -mt-4 mb-6">7-Day Free Trial Included</p>
            <ul className="text-left space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-white font-bold"><Check className="text-[#00cec9]" size={20} /> Full AI Marketing Plans</li>
              <li className="flex items-center gap-3 text-white font-bold"><Check className="text-[#00cec9]" size={20} /> Professional EPK Builder</li>
              <li className="flex items-center gap-3 text-white font-bold"><Check className="text-[#00cec9]" size={20} /> Direct Gig Connections</li>
              <li className="flex items-center gap-3 text-white font-bold"><Check className="text-[#00cec9]" size={20} /> Pitching Window Alerts</li>
              <li className="flex items-center gap-3 text-zinc-300"><Check className="text-[#00cec9]" size={20} /> Everything in Free</li>
              <li className="flex items-center gap-3 text-zinc-300"><Check className="text-[#00cec9]" size={20} /> Priority Support</li>
            </ul>
            <button 
              onClick={() => setModalOpen('upgrade')}
              className="w-full py-4 rounded-full bg-[#6c5ce7] text-white font-bold hover:bg-[#5b4bc4] transition-all shadow-lg shadow-[#6c5ce7]/30 animate-pulse"
            >
              {user?.subscriptionStatus === 'PREMIUM' && !user?.trialEndsAt ? 'Manage Subscription' : 'Start Free Trial'}
            </button>
          </div>

          {/* One-time EPK */}
          <div className="bg-[#1a1a2e] rounded-[20px] p-10 border border-white/10 flex flex-col text-center hover:-translate-y-2 transition-all duration-300">
            <div className="text-2xl font-bold mb-2">EPK Solo</div>
            <div className="text-5xl font-bold my-6">$2<span className="text-lg text-zinc-400 font-normal">/one-time</span></div>
            <ul className="text-left space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3 text-white font-bold"><Check className="text-[#00cec9]" size={20} /> Professional EPK Builder</li>
              <li className="flex items-center gap-3 text-zinc-300"><Check className="text-[#00cec9]" size={20} /> 1 Month Profile Hosting</li>
              <li className="flex items-center gap-3 text-zinc-300"><Check className="text-[#00cec9]" size={20} /> Shareable Link</li>
              <li className="flex items-center gap-3 text-zinc-500 line-through"><X size={20} /> AI Marketing Plans</li>
              <li className="flex items-center gap-3 text-zinc-500 line-through"><X size={20} /> Gig Connections</li>
              <li className="flex items-center gap-3 text-zinc-300"><Check className="text-[#00cec9]" size={20} /> Basic Marketing Tips</li>
            </ul>
            <button 
              onClick={() => setModalOpen('epk')}
              className="w-full py-4 rounded-full bg-[#00cec9] text-black font-bold hover:bg-[#00b894] transition-colors"
            >
              Get EPK Only
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {modalOpen === 'upgrade' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm" onClick={() => setModalOpen(null)}>
          <div className="bg-[#1a1a2e] rounded-3xl p-10 max-w-lg w-full border border-[#6c5ce7] relative text-center" onClick={e => e.stopPropagation()}>
            <button className="absolute top-6 right-6 text-zinc-500 hover:text-white" onClick={() => setModalOpen(null)}>
              <X size={24} />
            </button>
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-3xl font-bold mb-4">Try Premium Free for 7 Days</h2>
            <p className="text-zinc-400 mb-8">Unlock the full power of IndieAxis. Get AI-driven strategies, book more gigs, and never miss a pitching window. No commitment today.</p>
            
            <div className="space-y-4 mb-8">
              {user?.trialUsed ? (
                <button 
                  onClick={() => initiatePayment('premium')}
                  disabled={processing}
                  className="w-full py-4 rounded-full bg-[#6c5ce7] text-white font-bold hover:bg-[#5b4bc4] transition-all disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Upgrade to Premium ($5)'}
                </button>
              ) : (
                <button 
                  onClick={startTrial}
                  disabled={processing}
                  className="w-full py-4 rounded-full bg-[#6c5ce7] text-white font-bold hover:bg-[#5b4bc4] transition-all disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Start My 7-Day Free Trial'}
                </button>
              )}
              <p className="text-sm text-zinc-500">Then $5.00/month. Cancel anytime before trial ends.</p>
            </div>
            <p className="text-xs text-zinc-600">By clicking above, you agree to our terms.</p>
          </div>
        </div>
      )}

      {/* EPK Modal */}
      {modalOpen === 'epk' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm" onClick={() => setModalOpen(null)}>
          <div className="bg-[#1a1a2e] rounded-3xl p-10 max-w-lg w-full border border-[#6c5ce7] relative text-center" onClick={e => e.stopPropagation()}>
            <button className="absolute top-6 right-6 text-zinc-500 hover:text-white" onClick={() => setModalOpen(null)}>
              <X size={24} />
            </button>
            <div className="text-6xl mb-6">📄</div>
            <h2 className="text-3xl font-bold mb-4">Professional EPK Solo</h2>
            <p className="text-zinc-400 mb-8">Just need an Electronic Press Kit? Create a stunning, opportunity-ready EPK to share with labels and curators for a one-time fee.</p>
            
            <div className="mb-8">
              <button 
                onClick={() => initiatePayment('epk-once')}
                disabled={processing}
                className="w-full py-4 rounded-full bg-[#00cec9] text-black font-bold hover:bg-[#00b894] transition-all disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Purchase EPK ($2)'}
              </button>
            </div>
            <p className="text-sm text-zinc-500">Unlimited edits for 30 days.</p>
          </div>
        </div>
      )}
    </div>
  );
}
