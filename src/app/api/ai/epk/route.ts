import { NextResponse } from 'next/server';
import { generateWithGroq, parseJsonFromResponse } from '@/lib/groq';

interface EPKResult {
  headline: string;
  bio: string;
  genreDescription: string;
  achievements: string[];
  pressQuotes: { text: string; source: string }[];
  contactSection: {
    bookingEmail: string;
    pressContact: string;
    socialHandles: string;
  };
  oneLiner: string;
  highlights: string[];
}

export async function POST(request: Request) {
  try {
    const { name, bio, genre, location, achievements, contactEmail, socialLinks } =
      await request.json();

    if (!name || !genre) {
      return NextResponse.json(
        { error: 'Artist name and genre are required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a professional music publicist who writes compelling Electronic Press Kits (EPKs) for indie artists. Write in a professional but authentic tone. Always respond with valid JSON only.`;

    const userPrompt = `Build an Electronic Press Kit for this indie artist.

Name: ${name}
Bio: ${bio || 'Not provided'}
Genre: ${genre}
Location: ${location || 'Not specified'}
Achievements: ${achievements || 'None listed yet'}
Contact Email: ${contactEmail || 'Not provided'}
Social Links: ${socialLinks || 'Not provided'}

Return JSON:
{
  "headline": "Compelling one-line headline for the artist",
  "bio": "Professional 3-4 paragraph bio suitable for press and booking agents",
  "genreDescription": "1-2 sentences describing their sound and what makes them unique",
  "achievements": ["achievement 1", "achievement 2"],
  "pressQuotes": [{ "text": "quote text", "source": "Publication/Blog name" }],
  "contactSection": {
    "bookingEmail": "suggested email format",
    "pressContact": "press inquiry details",
    "socialHandles": "formatted social media handles"
  },
  "oneLiner": "Short elevator pitch (under 20 words)",
  "highlights": ["key highlight 1", "key highlight 2", "key highlight 3"]
}

Generate 2 realistic-sounding press quotes if none provided. Polish the bio professionally.`;

    const raw = await generateWithGroq(systemPrompt, userPrompt);
    const result = parseJsonFromResponse<EPKResult>(raw);

    return NextResponse.json(result);
  } catch (error) {
    console.error('EPK generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate EPK' },
      { status: 500 }
    );
  }
}
