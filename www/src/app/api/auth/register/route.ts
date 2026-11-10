import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authCookieName } from '@/lib/strapi-auth';

const schema = z.object({
  username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json().catch(() => null));
  if (!result.success) {
    return NextResponse.json({ error: 'Enter a valid username, email address, and password (at least 8 characters).' }, { status: 400 });
  }

  const apiUrl = (process.env.STRAPI_API_URL || 'https://buildersapi.salemcapital.cd').replace(/\/+$/, '');
  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl}/api/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Unable to reach Strapi registration.', error);
    return NextResponse.json({ error: 'Registration is temporarily unavailable.' }, { status: 502 });
  }

  if (!upstream.ok) {
    console.error(`Strapi registration failed: ${upstream.status} ${upstream.statusText}`);
    return NextResponse.json(
      { error: upstream.status >= 500 ? 'Registration is temporarily unavailable.' : 'This username or email may already be registered.' },
      { status: upstream.status >= 500 ? 502 : 400 },
    );
  }

  let payload: { jwt?: unknown; user?: { id?: unknown; username?: unknown; email?: unknown } };
  try {
    payload = await upstream.json();
  } catch (error) {
    console.error('Strapi returned an invalid registration response.', error);
    return NextResponse.json({ error: 'Registration is temporarily unavailable.' }, { status: 502 });
  }

  if (
    typeof payload.jwt !== 'string' ||
    typeof payload.user?.id !== 'number' ||
    typeof payload.user.username !== 'string' ||
    typeof payload.user.email !== 'string'
  ) {
    console.error('Strapi returned incomplete registration data.');
    return NextResponse.json({ error: 'Registration is temporarily unavailable.' }, { status: 502 });
  }

  const response = NextResponse.json({
    user: { id: payload.user.id, username: payload.user.username, email: payload.user.email },
  }, { status: 201 });
  response.cookies.set(authCookieName, payload.jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
