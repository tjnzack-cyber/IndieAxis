import { NextResponse } from 'next/server';
import { generateWithGroq, parseJsonFromResponse } from '@/lib/groq';

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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Royalty bodies generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate royalty recommendations' },
      { status: 500 }
    );
  }
}
