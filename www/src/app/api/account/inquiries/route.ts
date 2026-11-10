import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authCookieName, getAuthenticatedUser, getMyInquiries } from '@/lib/strapi-auth';

export async function GET() {
  const token = (await cookies()).get(authCookieName)?.value;
  if (!token) return NextResponse.json({ error: 'Please sign in to view your inquiries.' }, { status: 401 });

  const identity = await getAuthenticatedUser(token);
  if (!identity.ok) {
    return NextResponse.json(
      { error: identity.status === 401 ? 'Your session has expired.' : 'Your inquiries are temporarily unavailable.' },
      { status: identity.status },
    );
  }

  const result = await getMyInquiries(token, identity.user);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.status === 401 ? 'Your session has expired.' : 'Your inquiries are temporarily unavailable.' },
      { status: result.status },
    );
  }

  return NextResponse.json({ inquiries: result.inquiries });
}
