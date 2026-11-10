import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authCookieName } from '@/lib/strapi-auth';

const schema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json().catch(() => null));
  if (!result.success) {
    return NextResponse.json({ error: 'Enter a valid email or username and password.' }, { status: 400 });
  }

  const apiUrl = (process.env.STRAPI_API_URL || 'https://buildersapi.salemcapital.cd').replace(/\/+$/, '');
  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Unable to reach Strapi login.', error);
    return NextResponse.json({ error: 'Sign-in is temporarily unavailable.' }, { status: 502 });
  }

  if (!upstream.ok) {
    console.error(`Strapi login failed: ${upstream.status} ${upstream.statusText}`);
    return NextResponse.json(
      { error: upstream.status >= 500 ? 'Sign-in is temporarily unavailable.' : 'The email or password is incorrect.' },
      { status: upstream.status >= 500 ? 502 : 401 },
    );
  }

  let payload: { jwt?: unknown; user?: { id?: unknown; username?: unknown; email?: unknown } };
  try {
    payload = await upstream.json();
  } catch (error) {
    console.error('Strapi returned an invalid login response.', error);
    return NextResponse.json({ error: 'Sign-in is temporarily unavailable.' }, { status: 502 });
  }

  if (
    typeof payload.jwt !== 'string' ||
    typeof payload.user?.id !== 'number' ||
    typeof payload.user.username !== 'string' ||
    typeof payload.user.email !== 'string'
  ) {
    console.error('Strapi returned incomplete login data.');
    return NextResponse.json({ error: 'Sign-in is temporarily unavailable.' }, { status: 502 });
  }

  const response = NextResponse.json({
    user: { id: payload.user.id, username: payload.user.username, email: payload.user.email },
  });
  response.cookies.set(authCookieName, payload.jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
