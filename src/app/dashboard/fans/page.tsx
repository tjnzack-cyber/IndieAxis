'use client';
import { useEffect, useState } from 'react';
import { ArtistProfile } from '@/types';
import FanCRM from '@/components/FanCRM';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
'use client';
import { useEffect, useState } from 'react';
import { ArtistProfile } from '@/types';
import FanCRM from '@/components/FanCRM';
import PageLoader from '@/components/PageLoader';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function FansPage() {
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => { setArtist(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading your contacts…" />;

  return (
    <div className="min-h-screen bg-[#0b0b1a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <Link href="/dashboard/profile"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-pink-400 transition-colors mb-4">
            <ChevronLeft size={20} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight">Fan & Contact CRM</h1>
          <p className="text-zinc-500 mt-1">Manage fans, industry contacts, press, venues and curators</p>
        </header>
        {artist && <FanCRM artistId={artist.id} />}
      </div>
    </div>
  );
}
export default function FansPage() {
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => { setArtist(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-white bg-[#0b0b1a] min-h-screen">Loading contacts...</div>;

  return (
    <div className="min-h-screen bg-[#0b0b1a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <Link href="/dashboard/profile"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-pink-400 transition-colors mb-4">
            <ChevronLeft size={20} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight">Fan & Contact CRM</h1>
          <p className="text-zinc-500 mt-1">Manage fans, industry contacts, press, venues and curators</p>
        </header>
        {artist && <FanCRM artistId={artist.id} />}
      </div>
    </div>
  );
}
