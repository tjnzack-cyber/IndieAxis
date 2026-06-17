import ReleasePlanner from './ReleasePlanner'
'use client';

import { useEffect, useState } from 'react';
import { ArtistProfile, EPK, MarketingPlan, GigApplication, Gig, User } from '@/types';
import { cn } from '@/lib/utils';
import { Users, BarChart3, Rocket, MessageSquare, Share2, Edit2, ExternalLink, Bell, GraduationCap, ChevronRight } from 'lucide-react';

import Link from 'next/link';
import NotificationCenter from './NotificationCenter';
import OpportunityTracker from './OpportunityTracker';
import GoalTracker from './GoalTracker';
import EPKEditor from './EPKEditor';

interface ArtistProfileExtended extends ArtistProfile {
  user: User;
  epks: EPK[];
  marketingPlans: MarketingPlan[];
  gigApplications: (GigApplication & { gig: Gig })[];
}

export default function ArtistDashboard() {
  const [artist, setArtist] = useState<ArtistProfileExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setArtist(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading artist profile:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-white">Loading your dashboard...</div>;
  if (!artist) return (
    <div className="p-8 text-center text-white min-h-screen bg-[#0b0b1a] flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-2">Welcome to IndieAxis!</h2>
      <p className="text-zinc-400 mb-6">Let's set up your artist profile to get started.</p>
      <a href="/dashboard/marketing" className="px-6 py-3 bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white rounded-lg font-bold">
        Start with Marketing Plan
      </a>
    </div>
  );

  const activePlan = artist.marketingPlans.find(p => p.status === 'ACTIVE') || artist.marketingPlans[0];
  const trialDaysLeft = artist.user.trialEndsAt ? Math.ceil((new Date(artist.user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;

  return (
    <div className="max-w-4xl mx-auto bg-zinc-950 rounded-xl shadow-2xl overflow-hidden min-h-screen border border-white/5">
      {/* Trial Banner */}
      {artist.user.subscriptionStatus === 'PREMIUM' && artist.user.trialEndsAt && (
        <div className="bg-[#6c5ce7] text-white px-6 py-2 flex items-center justify-between">
          <div className="text-sm font-bold">
            🔥 Free trial active: {trialDaysLeft} days remaining
          </div>
          <Link href="/pricing" className="text-xs font-black uppercase tracking-widest bg-white text-[#6c5ce7] px-3 py-1 rounded-full hover:bg-zinc-200 transition-colors">
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Free Plan Banner */}
      {artist.user.subscriptionStatus === 'FREE' && (
        <div className="bg-zinc-800 text-zinc-300 px-6 py-2 flex items-center justify-between">
          <div className="text-sm font-bold">
            You are on the Free plan. Upgrade for AI marketing & gig matching.
          </div>
          <Link href="/pricing" className="text-xs font-black uppercase tracking-widest bg-cyan-400 text-black px-3 py-1 rounded-full hover:bg-white transition-colors">
            See Plans
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex-shrink-0 border-2 border-indigo-500/20">
            {artist.profileImageUrl ? (
              <img src={artist.profileImageUrl} alt={artist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                <Users size={32} />
              </div>
            )}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 md:mb-1">Artist Profile</div>
            <h1 className="text-xl md:text-3xl font-black text-zinc-900 dark:text-white leading-tight">{artist.name}</h1>
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              {artist.genre} • {artist.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 md:p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors relative"
          >
            <Bell size={18} />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full border-2 border-white dark:border-zinc-900" />
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/profile/edit'}
            className="px-4 py-2 bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white text-sm font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        </div>
      </header>

      {showNotifications && (
        <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <NotificationCenter />
        </div>
      )}

      <div className="p-4 md:p-8 grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">
        {/* Stats */}
        <div className="bg-indigo-600 p-4 md:p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-1 md:mb-2 opacity-80 text-[10px] md:text-sm uppercase tracking-wider font-bold">
            <BarChart3 size={14} />
            Spotify Listeners
          </div>
          <h3 className="text-2xl md:text-4xl font-black italic">
            {(artist.socialLinks as any)?.spotifyListeners || '—'}
          </h3>
        </div>
        <div className="bg-violet-500 p-4 md:p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-1 md:mb-2 opacity-80 text-[10px] md:text-sm uppercase tracking-wider font-bold">
            <Share2 size={14} />
            Instagram Followers
          </div>
          <h3 className="text-2xl md:text-4xl font-black italic">
            {(artist.socialLinks as any)?.instagramFollowers || '—'}
          </h3>
        </div>
        <div className="bg-violet-500 p-4 md:p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-1 md:mb-2 opacity-80 text-[10px] md:text-sm uppercase tracking-wider font-bold">
            <Share2 size={14} />
            TikTok Followers
          </div>
          <h3 className="text-2xl md:text-4xl font-black italic">
            {(artist.socialLinks as any)?.tiktokFollowers || '—'}
          </h3>
        </div>

        {/* Marketing Plan */}
        <section className="md:col-span-2 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Rocket className="text-cyan-500" size={24} />
              Current Marketing Plan: "{activePlan?.title}"
            </h2>
            <Link
              href="/dashboard/marketing"
              className="text-pink-400 hover:text-pink-300 text-sm font-semibold flex items-center gap-1"
            >
              Generate AI Plan
              <ExternalLink size={14} />
            </Link>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-600 dark:text-zinc-400">Progress</span>
              <span className="text-cyan-500 font-bold">45% complete</span>
            </div>
            <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-cyan-500 transition-all" style={{ width: '45%' }}></div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">
              Next Task: Submit to 'Indie Vibes' Playlist
            </p>
          </div>
        </section>

        {/* Opportunities */}
        <section className="md:col-span-2 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="text-indigo-500" size={24} />
              Opportunity Matching
            </h2>
            <Link
              href="/dashboard/opportunities"
              className="text-indigo-500 hover:text-indigo-400 text-sm font-semibold flex items-center gap-1"
            >
              View All Opportunities
              <ExternalLink size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {artist.gigApplications.length > 0 ? (
              artist.gigApplications.map(app => (
                <div key={app.id} className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex justify-between items-center shadow-sm">
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-white">{app.gig.title}</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{app.gig.location}</p>
                  </div>
                  <span className={cn(
                    "text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wider",
                    app.status === 'PENDING' ? "bg-amber-100 text-amber-700" :
                    app.status === 'ACCEPTED' ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                  )}>
                    {app.status}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex justify-between items-center shadow-sm hover:border-indigo-200 transition-all">
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-white">The Rusty Anchor - Live Set (June 15)</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Camden, London</p>
                  </div>
                  <button className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all">
                    Apply
                  </button>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex justify-between items-center shadow-sm hover:border-indigo-200 transition-all">
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-white">Underground Beats Podcast - Interview</h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Remote / London</p>
                  </div>
                  <button className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all">
                    Apply
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* EPK Status */}
        <section className="md:col-span-2 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">AI Press Kit</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                Build a professional EPK with AI from your profile, bio, and achievements.
              </p>
              <Link href="/dashboard/epk" className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#6c5ce7] to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-lg font-semibold transition-all text-sm">
                <Share2 size={16} />
                Build EPK with AI
              </Link>
            </div>
            <div className="bg-indigo-600/5 p-6 rounded-xl border border-indigo-500/20">
              <h3 className="text-lg font-bold text-indigo-400 mb-2 flex items-center gap-2">
                <GraduationCap size={20} />
                Learning & Revenue
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                Access success strategies and manage your royalty collection bodies.
              </p>
              <Link
                href="/dashboard/hub"
                className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all text-sm"
              >
                Go to Hub
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Phase 1: Opportunity Applications Tracker ── */}
        <section className="md:col-span-2 mt-4">
          <OpportunityTracker artistId={artist.id} />
        </section>

        {/* ── Phase 1: Goal & Task Progress Tracker ── */}
        <section className="md:col-span-2 mt-4">
          <GoalTracker artistId={artist.id} />
        </section>

        {/* ── Phase 1: EPK Editor & Public Link ── */}
        <section className="md:col-span-2 mt-4">
          <EPKEditor artistId={artist.id} artistName={artist.name} />
        </section>

      </div>
    </div>
  );
}
