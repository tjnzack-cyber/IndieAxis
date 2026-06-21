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

export async function POST(request: Request) {
  try {
    const { artistName, releaseTitle, releaseType, genre, releaseDate, notes } =
      await request.json();

    if (!artistName || !releaseTitle) {
      return NextResponse.json(
        { error: 'Artist name and release title are required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a music marketing copywriter who writes exciting, authentic release announcements for indie artists. Avoid generic hype language and corporate-sounding phrases. Write like a real artist talking to real fans.

CRITICAL: You must respond with ONLY a single valid JSON object. No markdown code fences, no commentary before or after, no explanations. Just the raw JSON object starting with { and ending with }.
Inside string values, never use double-quote characters — use single quotes or rephrase instead. Keep every string on a single line with no literal line breaks inside it (use \\n if you need a break).`;

    const userPrompt = `Write release announcement copy for an indie artist.
Artist: ${artistName}
Release Title: ${releaseTitle}
Release Type: ${releaseType || 'Single'}
Genre: ${genre || 'Independent'}
Release Date: ${releaseDate || 'Coming soon'}
Extra Notes: ${notes || 'None'}

Respond with exactly this JSON shape and nothing else:
{
  "instagramCaption": "engaging Instagram caption, 2-4 short paragraphs separated by \\n\\n, casual and authentic tone, include 1-2 emojis max, no double quotes inside the text",
  "tiktokCaption": "short punchy TikTok caption, under 150 characters, hook-driven, no double quotes inside the text",
  "twitterPost": "X/Twitter post under 280 characters, no double quotes inside the text",
  "pressReleaseBlurb": "2-3 sentence formal press blurb suitable for blogs and playlist pitches, no double quotes inside the text",
  "emailNewsletterBlurb": "short warm paragraph for an email to fans, 3-4 sentences, no double quotes inside the text",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8"]
}

Hashtags must be plain words or phrases with no spaces and no # symbol.`;

    const raw = await generateWithGroq(systemPrompt, userPrompt);

    let result: ReleaseAnnouncementResult;
    try {
      result = parseJsonFromResponse<ReleaseAnnouncementResult>(raw);
    } catch (parseErr) {
      // Retry once with an even stricter instruction if the first pass fails
      console.warn('First JSON parse failed, retrying with stricter prompt. Raw:', raw.slice(0, 500));
      const retryPrompt = `${userPrompt}\n\nIMPORTANT: Your previous response could not be parsed as JSON. Respond with ONLY the raw JSON object, no other text, no markdown fences, properly escaped strings.`;
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
