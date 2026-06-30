import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateWithGroq, parseJsonFromResponse } from '@/lib/groq';
import { canUse, incrementUsage } from '@/lib/entitlements';

interface GigOpportunitiesResult {
  gigs: {
    title: string;
    location: string;
    venueType: string;
    description: string;
    matchScore: number;
    gigDate: string;
    pitchDeadline: string;
    howToApply: string;
  }[];
  pitchingWindows: {
    month: string;
    title: string;
    deadline: string;
    description: string;
    category: string;
  }[];
  localTips: string[];
  networkingSuggestions: string[];
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { allowed, limit, used } = await canUse(userId, 'ai_generation');
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'AI generation limit reached for your plan this month',
          limit,
          used,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const { location, genre, artistName, experienceLevel, willingToTravel } =
      await request.json();
    if (!location || !genre) {
      return NextResponse.json(
        { error: 'Location and genre are required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a booking agent and talent scout expert in indie music. Suggest realistic gig opportunities, venues, festivals, and pitching windows. Always respond with valid JSON only.`;
    const userPrompt = `Suggest gig opportunities and pitching windows for an indie artist.
Artist: ${artistName || 'Independent Artist'}
Location: ${location}
Genre: ${genre}
Experience Level: ${experienceLevel || 'Emerging'}
Willing to travel: ${willingToTravel || 'Within region'}
Return JSON:
{
  "gigs": [
    {
      "title": "Venue/Event name",
      "location": "City, Country",
      "venueType": "e.g. Club, Festival, Podcast",
      "description": "Why this is a good fit",
      "matchScore": 85,
      "gigDate": "Approximate date or season",
      "pitchDeadline": "When to apply",
      "howToApply": "Application process"
    }
  ],
  "pitchingWindows": [
    {
      "month": "JAN",
      "title": "Opportunity name",
      "deadline": "Deadline details",
      "description": "What it is and why it matters",
      "category": "Festival/Playlist/Radio/Venue"
    }
  ],
  "localTips": ["tip 1", "tip 2", "tip 3"],
  "networkingSuggestions": ["suggestion 1", "suggestion 2"]
}
Include 5-8 realistic gig opportunities near ${location} for ${genre} artists and 5-6 pitching windows for the coming year.`;

    const raw = await generateWithGroq(systemPrompt, userPrompt);
    const result = parseJsonFromResponse<GigOpportunitiesResult>(raw);

    await incrementUsage(userId, 'ai_generation');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Gig opportunities generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate gig opportunities' },
      { status: 500 }
    );
  }
}
