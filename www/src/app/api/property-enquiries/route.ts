import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { authCookieName, getAuthenticatedUser } from '@/lib/strapi-auth';

const schema = z.object({
  phone: z.string().trim().min(6).max(40),
  message: z.string().trim().min(10).max(3000),
  property: z.string().trim().min(1).max(128),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const data = schema.safeParse(await request.json().catch(() => null));
  if (!data.success) {
    return NextResponse.json({ error: 'Please check the form fields and try again.' }, { status: 400 });
  }
  if (data.data.website) return NextResponse.json({ ok: true });

  const apiUrl = (process.env.STRAPI_API_URL || 'https://buildersapi.salemcapital.cd').replace(/\/+$/, '');
  const sessionToken = (await cookies()).get(authCookieName)?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Sign in or create an account to request this property.' }, { status: 401 });
  }

  const identity = await getAuthenticatedUser(sessionToken);
  if (!identity.ok) {
    return NextResponse.json(
      { error: identity.status === 401 ? 'Please sign in again before sending an inquiry.' : 'The enquiry service is temporarily unavailable.' },
      { status: identity.status },
    );
  }

  const message = [
    `Name: ${identity.user.username}`,
    `Email: ${identity.user.email}`,
    `Phone: ${data.data.phone}`,
    '',
    data.data.message,
  ].join('\n');

  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl}/api/me/inquiries`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          message,
          property: data.data.property,
        },
      }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Unable to reach Strapi property enquiry endpoint.', error);
    return NextResponse.json({ error: 'The enquiry service is temporarily unavailable.' }, { status: 502 });
  }

  if (!upstream.ok) {
    console.error(`Strapi property enquiry failed: ${upstream.status} ${upstream.statusText}`);
    if (upstream.status === 409) {
      return NextResponse.json({ error: 'This property is no longer available for reservation.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'We could not send your message. Please contact us by phone or email.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
