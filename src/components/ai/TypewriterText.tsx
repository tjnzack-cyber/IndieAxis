'use client';
import { useEffect, useState, useRef } from 'react';

interface Props {
  text: string;
  /** ms delay between each character batch */
  speed?: number;
  /** characters revealed per tick — higher = faster for long text */
  charsPerTick?: number;
  className?: string;
  /** Called once the full text has been revealed */
  onComplete?: () => void;
  /** Skip animation entirely (e.g. on re-render of already-seen content) */
  instant?: boolean;
}

/**
 * Renders text with a "live typing" effect, like watching the AI write
 * in real time. Designed for short-to-medium AI text blocks (overviews,
 * bios, summaries) — not for huge JSON-driven sections, which should
 * render normally once parsed.
 */
export default function TypewriterText({
  text,
  speed = 18,
  charsPerTick = 2,
  className = '',
  onComplete,
  instant = false,
}: Props) {
  const [shown, setShown] = useState(instant ? text : '');
  const indexRef = useRef(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (instant) { setShown(text); return; }
    setShown('');
    indexRef.current = 0;
    completedRef.current = false;

    const interval = setInterval(() => {
      indexRef.current += charsPerTick;
      if (indexRef.current >= text.length) {
        setShown(text);
        clearInterval(interval);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      } else {
        setShown(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, instant]);

  const isTyping = shown.length < text.length;

  return (
    <span className={className}>
      {shown}
      {isTyping && (
        <span className="inline-block w-[2px] h-[1em] bg-pink-400 ml-0.5 align-middle animate-pulse" />
      )}
    </span>
  );
}
