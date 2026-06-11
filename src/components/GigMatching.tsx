'use client';

import { Gig, GigApplication, ArtistProfile, EPK, User as UserType } from '@/types';
import { cn, isPremium } from '@/lib/utils';
import { Calendar, MapPin, Music, Star, CheckCircle2, Clock, Plus, Lock, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import GigApplicationWizard from './GigApplicationWizard';
import Link from 'next/link';

interface Props {
  artist: Omit<ArtistProfile, 'gigApplications'> & { 
    user: UserType;
    gigApplications: (GigApplication & { gig: Gig })[];
    epks: EPK[];
  };
}

export default function GigMatching({ artist }: Props) {
  const [gigs, setGigs] = useState<(Gig & { matchScore: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const premium = isPremium(artist.user);

  useEffect(() => {
    // In a real app, this would fetch from /api/gigs
    // For now, we'll mock some matches based on the artist's genre/location
    const mockGigs: (Gig & { matchScore: number })[] = [
      {
        id: '1',
        title: 'The Windmill - Brixton Indie Night',
        location: 'London, UK',
        genre: 'Indie Pop',
        venueType: 'Curated Show',
        description: 'A monthly showcase for emerging indie talent.',
        gigDate: new Date('2026-06-15'),
        pitchDeadline: new Date('2026-05-30'),
        matchScore: 95
      },
      {
        id: '2',
        title: 'Old Blue Last - Showcase Series',
        location: 'London, UK',
        genre: 'Indie Pop',
        venueType: 'Industry Facing',
        description: 'Great for networking with labels and managers.',
        gigDate: new Date('2026-06-22'),
        pitchDeadline: new Date('2026-06-01'),
        matchScore: 88
      },
      {
        id: '3',
        title: 'Sofar Sounds London',
        location: 'London, UK',
        genre: 'Any',
        venueType: 'Intimate Gig',
        description: 'Secret location acoustic sessions.',
        gigDate: new Date('2026-07-05'),
        pitchDeadline: new Date('2026-06-10'),
        matchScore: 82
      }
    ];
    setGigs(mockGigs);
    setLoading(false);
  }, []);

  const handleApply = (gig: Gig) => {
    if (!premium) return;
    setSelectedGig(gig);
    setShowWizard(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'REJECTED': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {showWizard && selectedGig && (
        <GigApplicationWizard
          gig={selectedGig}
          epks={artist.epks || []}
          onClose={() => setShowWizard(false)}
          onSuccess={() => {
            // In a real app, we'd refetch the profile
            setShowWizard(false);
          }}
        />
      )}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Gig Matches Near You</h2>
            <p className="text-zinc-400 text-sm">Based on your genre: {artist.genre}</p>
          </div>
          <div className="flex items-center gap-3">
            {!premium && (
              <Link href="/pricing" className="text-xs font-black uppercase tracking-widest text-cyan-400 border border-cyan-400/20 px-3 py-1 rounded-full hover:bg-cyan-400 hover:text-black transition-all">
                Unlock with Premium
              </Link>
            )}
            <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
              <MapPin size={12} />
              {artist.location}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {gigs.map(gig => (
            <div key={gig.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center w-full sm:w-14 h-auto sm:h-14 bg-indigo-600 rounded-xl p-3 sm:p-0 text-white shrink-0">
                  <span className="text-xs uppercase font-black tracking-wider">{gig.gigDate?.toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xl font-black leading-none">{gig.gigDate?.getDate()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors leading-tight">{gig.title}</h3>
                      <p className="text-zinc-500 text-sm flex items-center gap-2 mt-1">
                        <MapPin size={14} className="text-indigo-500" />
                        {gig.location} • {gig.venueType}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleApply(gig)}
                      className={cn(
                        "w-full sm:w-auto px-8 py-3 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2",
                        premium 
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20" 
                          : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      )}
                    >
                      {!premium && <Lock size={14} />}
                      Apply Now
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
                    <div className="text-cyan-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Star size={12} fill="currentColor" />
                      {gig.matchScore}% Match
                    </div>
                    <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Users size={12} />
                      Artist Favorite
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="text-indigo-500" size={20} />
          Application Tracker
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artist.gigApplications.map(app => (
            <div key={app.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-white">{app.gig.title}</h4>
                <p className="text-xs text-zinc-500 mt-1">Submitted 2 days ago</p>
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border",
                getStatusColor(app.status)
              )}>
                {app.status} {app.status === 'ACCEPTED' && '🎉'}
              </span>
            </div>
          ))}
          {/* Mock data if none exist */}
          {artist.gigApplications.length === 0 && (
            <>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-white">SXSW 2027 Artist Showcase</h4>
                  <p className="text-xs text-zinc-500 mt-1">Submitted 1 week ago</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Under Review
                </span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-white">The Great Escape Festival</h4>
                  <p className="text-xs text-zinc-500 mt-1">Accepted via IndieAxis</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  Accepted 🎉
                </span>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
