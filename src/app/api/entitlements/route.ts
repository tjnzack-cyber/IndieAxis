import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getEntitlements } from '@/lib/entitlements';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const entitlements = await getEntitlements(session.user.id);

  // Infinity doesn't survive JSON.stringify (becomes null) — convert to a
  // string sentinel the frontend can check for explicitly.
  const limits = Object.fromEntries(
    Object.entries(entitlements.limits).map(([k, v]) => [k, v === Infinity ? 'unlimited' : v])
  );

  return NextResponse.json({ ...entitlements, limits });
}
