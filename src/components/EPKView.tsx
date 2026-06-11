'use client';

import { useEffect, useState } from 'react';
import { ArtistProfile, EPK } from '@/types';
import { cn } from '@/lib/utils';
import { Music, Play, Mail, Globe, ExternalLink } from 'lucide-react';

interface EPKExtended extends EPK {
  artist: ArtistProfile;
}

export default function EPKView({ slug }: { slug: string }) {
  const [epk, setEpk] = useState<EPKExtended | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/epk/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('EPK not found or private');
        return res.json();
      })
      .then(data => {
        setEpk(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading EPK:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading EPK...</div>;
  if (error || !epk) return <div className="min-h-screen bg-black flex items-center justify-center text-white">{error || 'EPK not found'}</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-cyan-500/30">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-zinc-950 z-10"></div>
        <img 
          src={epk.artist.profileImageUrl || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070&auto=format&fit=crop"} 
          alt={epk.artist.name} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {epk.artist.name}
          </h1>
          <p className="text-xl md:text-2xl text-cyan-400 font-medium tracking-widest uppercase mb-8 opacity-90">
            {epk.artist.genre} • {epk.artist.location}
          </p>
          <a 
            href={epk.musicLinks?.spotify || "#"} 
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-xl"
          >
            <Play fill="currentColor" size={20} />
            Listen on Spotify
          </a>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-20 space-y-32">
        {/* About */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold uppercase tracking-widest border-b border-zinc-800 pb-4 text-cyan-500">
            About
          </h2>
          <p className="text-xl leading-relaxed text-zinc-300 font-light">
            {epk.artist.bio || "No bio available."}
          </p>
        </section>

        {/* Music */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold uppercase tracking-widest border-b border-zinc-800 pb-4 text-cyan-500">
            Music
          </h2>
          <div className="aspect-video bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 group cursor-pointer hover:border-indigo-500/50 transition-colors">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Music size={32} />
              </div>
              <p className="text-zinc-500 font-medium">[ Spotify / SoundCloud Player Embed ]</p>
            </div>
          </div>
        </section>

        {/* Press */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold uppercase tracking-widest border-b border-zinc-800 pb-4 text-cyan-500">
            Press
          </h2>
          <div className="space-y-8">
            {Array.isArray(epk.pressQuotes) ? epk.pressQuotes.map((quote: any, i: number) => (
              <blockquote key={i} className="border-l-4 border-indigo-600 pl-8 py-2">
                <p className="text-2xl font-serif italic text-zinc-100 mb-4">
                  "{quote.text}"
                </p>
                <cite className="text-cyan-400 font-bold uppercase tracking-wider not-italic">
                  — {quote.source}
                </cite>
              </blockquote>
            )) : (
              <p className="text-zinc-500 italic text-xl">"A refreshing take on modern pop. One to watch in 2024." — Indie Sound Blog</p>
            )}
          </div>
        </section>

        {/* Media */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold uppercase tracking-widest border-b border-zinc-800 pb-4 text-cyan-500">
            Media
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-square bg-zinc-900 rounded-xl overflow-hidden hover:opacity-80 transition-opacity">
                <img src={`https://images.unsplash.com/photo-1514525253361-bee8a4874093?q=80&w=1964&auto=format&fit=crop&crop=faces&q=40&index=${i}`} className="w-full h-full object-cover" alt="Artist media" />
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-zinc-900/50 p-12 rounded-3xl border border-zinc-800 text-center space-y-8">
          <h2 className="text-3xl font-bold uppercase tracking-widest text-cyan-500">
            Get In Touch
          </h2>
          <div className="space-y-2">
            <p className="text-zinc-400 uppercase tracking-widest text-sm">For booking and press inquiries:</p>
            <p className="text-3xl font-bold tracking-tight select-all">mgmt@{epk.artist.name.toLowerCase().replace(/\s/g, '')}.com</p>
          </div>
          
          <div className="flex justify-center gap-6 pt-4">
            <a href="#" className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors">
              <Globe size={24} />
            </a>
          </div>

          <button className="inline-flex items-center gap-2 bg-transparent border-2 border-indigo-600 hover:bg-indigo-600 text-white px-8 py-3 rounded-full font-bold transition-all mt-8">
            <ExternalLink size={20} />
            Download Press Kit (.ZIP)
          </button>
        </section>
      </main>

      <footer className="py-20 text-center border-t border-zinc-900">
        <p className="text-zinc-600 text-sm tracking-widest uppercase">
          Powered by <span className="text-white font-bold">IndieAxis</span>
        </p>
      </footer>
    </div>
  );
}
