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

    const systemPrompt = `You are a music marketing copywriter who writes exciting, authentic release announcements for indie artists. Avoid generic hype language and corporate-sounding phrases. Write like a real artist talking to real fans. Always respond with valid JSON only.`;

    const userPrompt = `Write release announcement copy for an indie artist.
Artist: ${artistName}
Release Title: "${releaseTitle}"
Release Type: ${releaseType || 'Single'}
Genre: ${genre || 'Independent'}
Release Date: ${releaseDate || 'Coming soon'}
Extra Notes: ${notes || 'None'}

Return JSON:
{
  "instagramCaption": "engaging Instagram caption, 2-4 short paragraphs, casual and authentic tone, include 1-2 emojis max",
  "tiktokCaption": "short punchy TikTok caption, under 150 characters, hook-driven",
  "twitterPost": "X/Twitter post under 280 characters",
  "pressReleaseBlurb": "2-3 sentence formal press blurb suitable for blogs and playlist pitches",
  "emailNewsletterBlurb": "short warm paragraph for an email to fans, 3-4 sentences",
  "hashtags": ["array of 8-10 relevant hashtags without the # symbol"]
}`;

    const raw = await generateWithGroq(systemPrompt, userPrompt);
    const result = parseJsonFromResponse<ReleaseAnnouncementResult>(raw);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Release announcement generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate release announcement' },
      { status: 500 }
    );
  }
}
