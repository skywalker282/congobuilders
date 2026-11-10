import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { authCookieName, getAuthenticatedUser } from '@/lib/strapi-auth';

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(6).max(40),
  message: z.string().trim().min(10).max(3000),
  property: z.string().trim().min(1).max(128),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json().catch(() => null));
  if (!result.success) {
    return NextResponse.json({ error: 'Please check the form fields and try again.' }, { status: 400 });
  }
  if (result.data.website) return NextResponse.json({ ok: true });

  const apiUrl = (process.env.STRAPI_API_URL || 'https://buildersapi.salemcapital.cd').replace(/\/+$/, '');
  const sessionToken = (await cookies()).get(authCookieName)?.value;
  const identity = sessionToken ? await getAuthenticatedUser(sessionToken) : undefined;
  if (identity && !identity.ok) {
    return NextResponse.json({ error: identity.status === 401 ? 'Please sign in again before sending an inquiry.' : 'The enquiry service is temporarily unavailable.' }, { status: identity.status });
  }

  const token = process.env.STRAPI_INQUIRY_API_TOKEN || process.env.STRAPI_API_TOKEN || (identity?.ok ? sessionToken : undefined);
  if (!token) {
    return NextResponse.json({ error: 'The enquiry service is not configured. Please contact us by phone or email.' }, { status: 503 });
  }

  const message = [
    `Property ID: ${result.data.property}`,
    `Name: ${result.data.name}`,
    `Email: ${result.data.email}`,
    `Phone: ${result.data.phone}`,
    '',
    result.data.message,
  ].join('\n');

  const inquiryData: Record<string, unknown> = {
    message,
    property: result.data.property,
    date: new Date().toISOString().slice(0, 10),
  };
  if (identity?.ok) inquiryData.customer = identity.user.id;

  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl}/api/inquiries`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: inquiryData }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Unable to reach Strapi property enquiry endpoint.', error);
    return NextResponse.json({ error: 'The enquiry service is temporarily unavailable.' }, { status: 502 });
  }

  if (!upstream.ok) {
    console.error(`Strapi property enquiry failed: ${upstream.status} ${upstream.statusText}`);
    const body = await upstream.text().catch((error: unknown) => {
      console.error('Unable to read the Strapi property enquiry error response.', error);
      return '';
    });
    if (identity?.ok && body.includes('Invalid key customer')) {
      return NextResponse.json({ error: 'The remote inquiry API cannot link this request to your account yet. Please contact us by phone or email.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'We could not send your message. Please contact us by phone or email.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
