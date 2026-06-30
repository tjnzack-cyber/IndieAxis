import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { artistName, location } = await request.json();
    if (!artistName) {
      return NextResponse.json({ error: 'Artist name required' }, { status: 400 });
    }

    const artist = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id },
    });

    // Cache check: if we already looked this artist up today, return the
    // cached snapshot instead of burning a Groq call. This is what keeps
    // dashboard-load lookups from costing anything beyond the first visit per day.
    if (artist) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const todaysSnapshot = await prisma.statSnapshot.findFirst({
        where: { artistId: artist.id, createdAt: { gte: startOfToday } },
        orderBy: { createdAt: 'desc' },
      });

      if (todaysSnapshot) {
        return NextResponse.json({
          found: true,
          spotifyListeners: todaysSnapshot.spotifyListeners,
          instagramFollowers: todaysSnapshot.instagramFollowers,
          tiktokFollowers: todaysSnapshot.tiktokFollowers,
          youtubeSubscribers: todaysSnapshot.youtubeSubscribers,
          soundcloudPlays: todaysSnapshot.soundcloudPlays,
          cached: true,
        });
      }
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

    // Save to StatSnapshot so subsequent loads today are served from cache
    if (artist && data.found) {
      await prisma.statSnapshot.create({
        data: {
          artistId: artist.id,
          spotifyListeners: data.spotifyListeners ?? null,
          instagramFollowers: data.instagramFollowers ?? null,
          tiktokFollowers: data.tiktokFollowers ?? null,
          youtubeSubscribers: data.youtubeSubscribers ?? null,
          soundcloudPlays: data.soundcloudPlays ?? null,
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Artist lookup error:', error);
    return NextResponse.json({ found: false }, { status: 200 });
  }
}
