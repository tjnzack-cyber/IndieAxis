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
 * Attempts to repair the single most common way LLMs break JSON:
 * an unescaped apostrophe or straight quote inside a string value
 * (e.g. "artist's debut" instead of "artist\'s debut"). This walks
 * the string character by character, tracking whether we're inside
 * a JSON string, and escapes any apostrophe found there. It leaves
 * the structural double-quotes (the ones that open/close each string)
 * untouched by checking what follows/precedes them.
 */
function repairUnescapedApostrophes(jsonStr: string): string {
  let result = '';
  let inString = false;
  let prevChar = '';

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];

    if (char === '"' && prevChar !== '\\') {
      inString = !inString;
      result += char;
    } else if (char === "'" && inString) {
      // Escape stray apostrophes found inside string values
      result += "\\'";
    } else {
      result += char;
    }

    prevChar = char;
  }

  return result;
}

/**
 * Parses a JSON object out of an LLM response, tolerating common
 * formatting mistakes:
 * - Markdown code fences (```json ... ```)
 * - Leading/trailing commentary text around the JSON
 * - Trailing commas before } or ]
 * - Smart/curly quotes used instead of straight quotes
 * - Unescaped apostrophes inside string values
 */
export function parseJsonFromResponse<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
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

  for (const candidate of candidates) {
    // Attempt 1: parse as-is
    try {
      return JSON.parse(candidate) as T;
    } catch { /* try next strategy */ }

    // Attempt 2: normalize smart quotes + strip trailing commas
    const cleaned = candidate
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(cleaned) as T;
    } catch { /* try next strategy */ }

    // Attempt 3: repair unescaped apostrophes inside string values
    try {
      return JSON.parse(repairUnescapedApostrophes(cleaned)) as T;
    } catch { /* try next candidate */ }
  }

  console.error('JSON parse failed. Raw response (first 800 chars):', text.slice(0, 800));
  throw new Error('Failed to parse AI response as JSON');
}
