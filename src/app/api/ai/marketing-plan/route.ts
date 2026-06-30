import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateWithGroq, parseJsonFromResponse } from '@/lib/groq';
import { canUse, incrementUsage } from '@/lib/entitlements';

interface MarketingPlanResult {
  title: string;
  strategy: string;
  goals: string[];
  tasks: { title: string; description: string; week: number }[];
  insights: string[];
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

    const { genre, location, goals, artistName, careerStage } = await request.json();
    if (!genre || !location || !goals) {
      return NextResponse.json(
        { error: 'Genre, location, and goals are required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert indie music marketing strategist. Generate personalized, actionable marketing plans for independent artists. Always respond with valid JSON only, no markdown or extra text.`;
    const userPrompt = `Create a personalized 8-week music marketing plan for an indie artist.
Artist: ${artistName || 'Independent Artist'}
Genre: ${genre}
Location: ${location}
Career Stage: ${careerStage || 'Emerging'}
Goals: ${goals}
Return JSON in this exact structure:
{
  "title": "Plan title",
  "strategy": "2-3 sentence overall strategy summary",
  "goals": ["goal 1", "goal 2", "goal 3", "goal 4"],
  "tasks": [
    { "title": "Task name", "description": "Specific actionable step", "week": 1 }
  ],
  "insights": ["insight 1", "insight 2", "insight 3"]
}
Include 12-16 tasks spread across weeks 1-8. Make recommendations specific to their genre and location.`;

    const raw = await generateWithGroq(systemPrompt, userPrompt);
    const result = parseJsonFromResponse<MarketingPlanResult>(raw);

    await incrementUsage(userId, 'ai_generation');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Marketing plan generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate marketing plan' },
      { status: 500 }
    );
  }
}
