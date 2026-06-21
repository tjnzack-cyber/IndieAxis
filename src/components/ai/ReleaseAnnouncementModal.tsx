'use client'
// src/components/ai/ReleaseAnnouncementModal.tsx
// Opens from a Release card — generates ready-to-post copy for that release.

import { useState } from 'react'
import { X, Sparkles, Copy, Check, Loader2, Instagram, Music2, Mail, FileText } from 'lucide-react'
import TypewriterText from './TypewriterText'

interface AnnouncementResult {
  instagramCaption: string
  tiktokCaption: string
  twitterPost: string
  pressReleaseBlurb: string
  emailNewsletterBlurb: string
  hashtags: string[]
}

interface Props {
  artistName: string
  releaseTitle: string
  releaseType: string
  genre?: string
  releaseDate?: string
  onClose: () => void
}

const THINKING_MESSAGES = [
  'Reading your release details…',
  'Finding the hook…',
  'Writing your captions…',
  'Drafting the press blurb…',
  'Picking hashtags…',
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 flex-shrink-0"
    >
      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
    </button>
  )
}

export default function ReleaseAnnouncementModal({
  artistName, releaseTitle, releaseType, genre, releaseDate, onClose,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnnouncementResult | null>(null)
  const [notes, setNotes] = useState('')
  const [msgIndex, setMsgIndex] = useState(0)
  const [igDone, setIgDone] = useState(false)

  async function generate() {
    setLoading(true)
    setError(null)
    setIgDone(false)
    const cycle = setInterval(() => setMsgIndex(i => (i + 1) % THINKING_MESSAGES.length), 1500)

    try {
      const res = await fetch('/api/ai/release-announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName, releaseTitle, releaseType, genre, releaseDate, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      clearInterval(cycle)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        onClick={e => e.stopPropagation()}
        className="relative bg-zinc-900 border border-purple-500/20 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-900/60 via-[#6c5ce7]/30 to-pink-900/40 backdrop-blur-lg px-5 py-4 border-b border-purple-500/20 flex items-center justify-between z-10">
          <div className="min-w-0">
            <h3 className="text-white font-bold text-base truncate">Release Announcement</h3>
            <p className="text-zinc-400 text-xs truncate">{releaseTitle}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white flex-shrink-0 ml-2">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!result && (
            <>
              <div>
                <label className="text-zinc-400 text-xs mb-1.5 block">Anything specific to mention? (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. featuring a guest artist, inspired by a breakup, first release in 2 years…"
                  className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>
              )}

              <button
                onClick={generate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#6c5ce7] to-pink-500 text-white hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> {THINKING_MESSAGES[msgIndex]}</>
                ) : (
                  <><Sparkles size={16} /> Generate Announcement</>
                )}
              </button>
            </>
          )}

          {result && (
            <div className="space-y-5">
              {/* Instagram */}
              <div className="bg-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-pink-400 text-xs font-bold uppercase tracking-wider">
                    <Instagram size={13} /> Instagram
                  </span>
                  <CopyButton text={result.instagramCaption} />
                </div>
                <p className="text-zinc-200 text-sm whitespace-pre-line min-h-[1.5em]">
                  <TypewriterText text={result.instagramCaption} speed={10} charsPerTick={2} onComplete={() => setIgDone(true)} />
                </p>
              </div>

              <div className={`space-y-5 transition-opacity duration-500 ${igDone ? 'opacity-100' : 'opacity-0'}`}>
                {/* TikTok */}
                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                      <Music2 size={13} /> TikTok
                    </span>
                    <CopyButton text={result.tiktokCaption} />
                  </div>
                  <p className="text-zinc-200 text-sm">{result.tiktokCaption}</p>
                </div>

                {/* Twitter/X */}
                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">X / Twitter</span>
                    <CopyButton text={result.twitterPost} />
                  </div>
                  <p className="text-zinc-200 text-sm">{result.twitterPost}</p>
                </div>

                {/* Press blurb */}
                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                      <FileText size={13} /> Press / Blog Pitch
                    </span>
                    <CopyButton text={result.pressReleaseBlurb} />
                  </div>
                  <p className="text-zinc-200 text-sm">{result.pressReleaseBlurb}</p>
                </div>

                {/* Email */}
                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold uppercase tracking-wider">
                      <Mail size={13} /> Fan Email
                    </span>
                    <CopyButton text={result.emailNewsletterBlurb} />
                  </div>
                  <p className="text-zinc-200 text-sm">{result.emailNewsletterBlurb}</p>
                </div>

                {/* Hashtags */}
                {result.hashtags?.length > 0 && (
                  <div className="bg-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-400 text-xs font-bold uppercase tracking-wider">Hashtags</span>
                      <CopyButton text={result.hashtags.map(h => `#${h}`).join(' ')} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.hashtags.map(h => (
                        <span key={h} className="text-xs bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded-full">#{h}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setResult(null); setNotes('') }}
                  className="w-full text-zinc-500 hover:text-white text-xs py-2 transition-colors"
                >
                  Generate again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
