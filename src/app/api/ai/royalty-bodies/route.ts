import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateWithGroq, parseJsonFromResponse } from '@/lib/groq';
import { canUse, incrementUsage } from '@/lib/entitlements';

interface RoyaltyBodiesResult {
  country: string;
  summary: string;
  organizations: {
    name: string;
    collects: string;
    url: string;
    registrationSteps: string;
    priority: 'Essential' | 'Recommended' | 'Optional';
  }[];
  checklist: { step: string; description: string }[];
  notes: string;
  estimatedTimeline: string;
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

    const { country, genre, isWriter, isPerformer } = await request.json();
    if (!country) {
      return NextResponse.json(
        { error: 'Country is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a music business expert specializing in royalty collection and PRO registration worldwide. Provide accurate, actionable guidance for indie artists. Always respond with valid JSON only. Use real organization names and URLs where possible.`;
    const userPrompt = `Recommend music business bodies for royalty collection for an indie artist.
Country: ${country}
Genre: ${genre || 'General'}
Writes own music: ${isWriter !== false ? 'Yes' : 'No'}
Performs live/records: ${isPerformer !== false ? 'Yes' : 'No'}
Return JSON:
{
  "country": "${country}",
  "summary": "Overview of royalty collection in this country",
  "organizations": [
    {
      "name": "Organization name",
      "collects": "What royalties they collect",
      "url": "Official website URL",
      "registrationSteps": "How to register (2-3 sentences)",
      "priority": "Essential"
    }
  ],
  "checklist": [
    { "step": "Step title", "description": "What to do" }
  ],
  "notes": "Important country-specific notes",
  "estimatedTimeline": "How long registration typically takes"
}
Include PROs, mechanical rights organizations, neighbouring rights collectors, and digital collection bodies relevant to ${country}. List 4-8 organizations.`;

    const raw = await generateWithGroq(systemPrompt, userPrompt);
    const result = parseJsonFromResponse<RoyaltyBodiesResult>(raw);

    await incrementUsage(userId, 'ai_generation');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Royalty bodies generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate royalty recommendations' },
      { status: 500 }
    );
  }
}
