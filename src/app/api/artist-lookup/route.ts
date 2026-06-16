import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { artistName, location } = await request.json();

    if (!artistName) {
      return NextResponse.json({ error: 'Artist name required' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Search your knowledge for the music artist "${artistName}" from "${location || 'unknown location'}". 
          
Find and return their approximate social media and streaming statistics. If you cannot find specific numbers, make reasonable estimates based on their known popularity level, or return null for unknown values.

Return ONLY a JSON object with no additional text:
{
  "found": true or false,
  "spotifyListeners": number or null,
  "instagramFollowers": number or null,
  "tiktokFollowers": number or null,
  "youtubeSubscribers": number or null,
  "soundcloudPlays": number or null,
  "bio": "brief bio if found or empty string",
  "verified": true if this is a well known artist or false if unknown/emerging
}`
        }
      ],
      temperature: 0.1,
    });

    const text = completion.choices[0]?.message?.content || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Artist lookup error:', error);
    return NextResponse.json({ found: false }, { status: 200 });
  }
}
