import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authCookieName, getAuthenticatedUser } from '@/lib/strapi-auth';

export async function GET() {
  const token = (await cookies()).get(authCookieName)?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 200 });

  const result = await getAuthenticatedUser(token);
  if (!result.ok) {
    const response = NextResponse.json(
      { error: result.status === 401 ? 'Your session has expired.' : 'Account details are temporarily unavailable.' },
      { status: result.status },
    );
    if (result.status === 401) response.cookies.set(authCookieName, '', { path: '/', maxAge: 0 });
    return response;
  }

  return NextResponse.json({ user: result.user });
}
