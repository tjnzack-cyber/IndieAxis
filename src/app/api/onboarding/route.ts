// src/app/api/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// Whitelisted fields per step — prevents a malformed request from writing
// to unrelated ArtistProfile columns. Steps 6 (subscription) and 7 (success)
// have no fields of their own — they only exist so onboardingStep/complete
// can advance past them.
const STEP_FIELDS: Record<number, string[]> = {
  2: ['name', 'profileImageUrl', 'country', 'genre', 'languages'],
  3: ['journeyStage'],
  4: ['challenges'],
  5: ['goals90Day'],
  6: [],
  7: [],
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  let artist = await prisma.artistProfile.findUnique({ where: { userId: user.id } });
  if (!artist) {
    artist = await prisma.artistProfile.create({
      data: { userId: user.id, name: user.email.split('@')[0] },
    });
  }

  return NextResponse.json({
    onboardingStep: artist.onboardingStep,
    onboardingCompleted: artist.onboardingCompleted,
    name: artist.name,
    profileImageUrl: artist.profileImageUrl,
    country: artist.country,
    genre: artist.genre,
    languages: artist.languages,
    journeyStage: artist.journeyStage,
    challenges: artist.challenges,
    goals90Day: artist.goals90Day,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const artist = await prisma.artistProfile.findUnique({ where: { userId: user.id } });
  if (!artist) {
    return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
  }

  const body = await request.json();
  const { step, data, complete } = body as { step: number; data?: Record<string, any>; complete?: boolean };

  if (step === undefined || !(step in STEP_FIELDS)) {
    return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
  }

  const allowed = STEP_FIELDS[step];
  const updateData: Record<string, any> = {};
  for (const field of allowed) {
    if (data && field in data) updateData[field] = data[field];
  }

  // Advance saved step only forward, never backward, so re-saving an
  // earlier step (e.g. user hits Back) doesn't reset their resume point.
  const nextStep = Math.max(artist.onboardingStep, step);

  const updated = await prisma.artistProfile.update({
    where: { id: artist.id },
    data: {
      ...updateData,
      onboardingStep: nextStep,
      ...(complete ? { onboardingCompleted: true } : {}),
    },
  });

  return NextResponse.json({
    onboardingStep: updated.onboardingStep,
    onboardingCompleted: updated.onboardingCompleted,
  });
}
