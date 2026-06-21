import { NextResponse } from 'next/server';
import { generateWithGroq, parseJsonFromResponse } from '@/lib/groq';

interface ReleaseAnnouncementResult {
  instagramCaption: string;
  tiktokCaption: string;
  twitterPost: string;
  pressReleaseBlurb: string;
  emailNewsletterBlurb: string;
  hashtags: string[];
}

// Strip characters that commonly break JSON generation from LLMs
// (smart quotes, stray backslashes) without mangling normal punctuation.
function sanitizeInput(value: string): string {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\\/g, '')
    .trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const artistName  = sanitizeInput(body.artistName || '');
    const releaseTitle = sanitizeInput(body.releaseTitle || '');
    const releaseType  = sanitizeInput(body.releaseType || 'Single');
    const genre         = sanitizeInput(body.genre || 'Independent');
    const releaseDate   = sanitizeInput(body.releaseDate || 'Coming soon');
    const notes          = sanitizeInput(body.notes || 'None');

    if (!artistName || !releaseTitle) {
      return NextResponse.json(
        { error: 'Artist name and release title are required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a music marketing copywriter who writes exciting, authentic release announcements for indie artists. Avoid generic hype language and corporate-sounding phrases. Write like a real artist talking to real fans.

CRITICAL RULES — your response will be parsed by a strict JSON parser, so:
1. Respond with ONLY a single valid JSON object. No markdown code fences, no commentary before or after.
2. NEVER use an apostrophe or single quote character inside any string value (not even for contractions like "don't" — write "do not" instead, or "artist's" as "artists").
3. NEVER use a double-quote character inside any string value.
4. Keep every string value on a single line — use a literal space instead of a line break.
5. Do not include any names with hyphens or special punctuation in a way that could be misread as a JSON control character — write them as plain words.`;

    const userPrompt = `Write release announcement copy for an indie artist.
Artist: ${artistName}
Release Title: ${releaseTitle}
Release Type: ${releaseType}
Genre: ${genre}
Release Date: ${releaseDate}
Extra Notes: ${notes}

Respond with exactly this JSON shape and nothing else:
{
  "instagramCaption": "engaging Instagram caption, 2-4 short sentences, casual and authentic tone, include 1-2 emojis max, absolutely no apostrophes or quote characters",
  "tiktokCaption": "short punchy TikTok caption, under 150 characters, hook-driven, absolutely no apostrophes or quote characters",
  "twitterPost": "X/Twitter post under 280 characters, absolutely no apostrophes or quote characters",
  "pressReleaseBlurb": "2-3 sentence formal press blurb suitable for blogs and playlist pitches, absolutely no apostrophes or quote characters",
  "emailNewsletterBlurb": "short warm paragraph for an email to fans, 3-4 sentences, absolutely no apostrophes or quote characters",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8"]
}

Hashtags must be plain words or phrases with no spaces and no # symbol.`;

    const raw = await generateWithGroq(systemPrompt, userPrompt);

    let result: ReleaseAnnouncementResult;
    try {
      result = parseJsonFromResponse<ReleaseAnnouncementResult>(raw);
    } catch (parseErr) {
      console.warn('First JSON parse failed, retrying. Raw:', raw.slice(0, 500));
      const retryPrompt = `${userPrompt}\n\nIMPORTANT: Your previous response could not be parsed as JSON, likely because of an apostrophe, quote mark, or line break inside a string value. Respond again with ONLY the raw JSON object — double-check that no string contains an apostrophe, quote character, or literal line break.`;
      const retryRaw = await generateWithGroq(systemPrompt, retryPrompt);
      result = parseJsonFromResponse<ReleaseAnnouncementResult>(retryRaw);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Release announcement generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate release announcement' },
      { status: 500 }
    );
  }
}
