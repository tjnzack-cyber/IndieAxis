const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Groq API error:', errorBody);
    throw new Error(`Groq API request failed: ${response.status}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No content returned from Groq API');
  }
  return content;
}

/**
 * Parses a JSON object out of an LLM response, tolerating common
 * formatting mistakes:
 * - Markdown code fences (```json ... ```)
 * - Leading/trailing commentary text around the JSON
 * - Trailing commas before } or ]
 * - Smart/curly quotes used instead of straight quotes
 */
export function parseJsonFromResponse<T>(text: string): T {
  // 1. Prefer content inside a fenced code block if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  // 2. Otherwise grab the first { ... last } in the text (handles stray commentary)
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  const braceSlice = firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
    ? text.slice(firstBrace, lastBrace + 1)
    : null;

  const candidates = [
    fenced?.[1]?.trim(),
    braceSlice,
    text.trim(),
  ].filter(Boolean) as string[];

  let lastError: unknown = null;

  for (const candidate of candidates) {
    // Try parsing as-is first
    try {
      return JSON.parse(candidate) as T;
    } catch (err) {
      lastError = err;
    }

    // Try a cleaned-up version: fix trailing commas and smart quotes
    try {
      const cleaned = candidate
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/,\s*([}\]])/g, '$1'); // remove trailing commas before } or ]
      return JSON.parse(cleaned) as T;
    } catch (err) {
      lastError = err;
    }
  }

  console.error('JSON parse failed. Raw response (first 800 chars):', text.slice(0, 800));
  throw new Error('Failed to parse AI response as JSON');
}
