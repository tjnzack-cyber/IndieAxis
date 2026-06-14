'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Camera } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    genre: '',
    location: '',
    profileImageUrl: '',
  });

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setForm({
          name: data.name || '',
          bio: data.bio || '',
          genre: data.genre || '',
          location: data.location || '',
          profileImageUrl: data.profileImageUrl || '',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.url) {
      setForm(prev => ({ ...prev, profileImageUrl: data.url }));
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    router.push('/dashboard/profile');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0b0b1a] flex items-center justify-center text-white">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b0b1a] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <Link href="/dashboard/profile" className="inline-flex items-center gap-2 text-zinc-400 hover:text-pink-400 transition-colors mb-4">
            <ChevronLeft size={20} />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-white">Edit Profile</h1>
          <p className="text-zinc-500 mt-1">Update your artist information</p>
        </header>

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-zinc-800 border-2 border-purple-500/30">
            {form.profileImageUrl ? (
              <img src={form.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <Camera size={32} />
              </div>
            )}
          </div>
          <label className="cursor-pointer px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg border border-purple-500/20 hover:border-pink-500 transition-all text-sm font-bold">
            {uploading ? 'Uploading...' : 'Upload Profile Picture'}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Artist Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 border border-purple-500/20 focus:border-pink-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({...form, bio: e.target.value})}
              rows={4}
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 border border-purple-500/20 focus:border-pink-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Genre</label>
            <input
              type="text"
              value={form.genre}
              onChange={e => setForm({...form, genre: e.target.value})}
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 border border-purple-500/20 focus:border-pink-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm({...form, location: e.target.value})}
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-3 border border-purple-500/20 focus:border-pink-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white font-black rounded-lg hover:opacity-90 transition-all"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
