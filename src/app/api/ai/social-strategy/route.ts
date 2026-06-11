import { NextResponse } from 'next/server';
import { generateWithGroq, parseJsonFromResponse } from '@/lib/groq';

interface SocialStrategyResult {
  overview: string;
  platforms: {
    name: string;
    strategy: string;
    contentIdeas: string[];
    postingFrequency: string;
    bestPractices: string[];
  }[];
  hashtagStrategy: string[];
  engagementTips: string[];
  contentCalendar: { week: number; focus: string; actions: string[] }[];
}

export async function POST(request: Request) {
  try {
    const { genre, targetAudience, location, platforms, artistName, goals } =
      await request.json();

    if (!genre || !targetAudience) {
      return NextResponse.json(
        { error: 'Genre and target audience are required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a social media strategist specializing in indie music artists. Provide practical, budget-friendly strategies. Always respond with valid JSON only.`;

    const userPrompt = `Create a tailored social media strategy for an indie artist.

Artist: ${artistName || 'Independent Artist'}
Genre: ${genre}
Target Audience: ${targetAudience}
Location: ${location || 'Global'}
Preferred Platforms: ${platforms || 'Instagram, TikTok, YouTube'}
Goals: ${goals || 'Grow fanbase and increase streams'}

Return JSON:
{
  "overview": "2-3 sentence strategy overview",
  "platforms": [
    {
      "name": "Platform name",
      "strategy": "Platform-specific approach",
      "contentIdeas": ["idea 1", "idea 2", "idea 3"],
      "postingFrequency": "e.g. 4-5 posts per week",
      "bestPractices": ["tip 1", "tip 2"]
    }
  ],
  "hashtagStrategy": ["hashtag approach 1", "hashtag approach 2"],
  "engagementTips": ["tip 1", "tip 2", "tip 3", "tip 4"],
  "contentCalendar": [
    { "week": 1, "focus": "Theme", "actions": ["action 1", "action 2"] }
  ]
}

Cover at least Instagram, TikTok, and one other platform. Include a 4-week content calendar.`;

    const raw = await generateWithGroq(systemPrompt, userPrompt);
    const result = parseJsonFromResponse<SocialStrategyResult>(raw);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Social strategy generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate social strategy' },
      { status: 500 }
    );
  }
}
