import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { authCookieName, getAuthenticatedUser } from '@/lib/strapi-auth';

const maxMessageLength = 2500;
const schema = z.object({
  phone: z.string().trim().min(6).max(40),
  message: z.string().trim().min(10).max(maxMessageLength),
  property: z.string().trim().min(1).max(128),
  customer: z.coerce.number().int().positive().optional(),
  progress: z.enum(['pending']).optional().default('pending'),
  price: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)),
  currency: z.enum(['USD', 'CDF']),
  website: z.string().max(0).optional(),
});

async function getStrapiError(response: Response): Promise<string | undefined> {
  const payload: unknown = await response.json().catch(() => null);
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    payload.error &&
    typeof payload.error === 'object' &&
    'message' in payload.error &&
    typeof payload.error.message === 'string'
  ) {
    return payload.error.message;
  }
  return undefined;
}

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
  if (data.data.customer !== undefined && data.data.customer !== identity.user.id) {
    return NextResponse.json({ error: 'The signed-in customer does not match this reservation.' }, { status: 400 });
  }
  if (/^\d+$/.test(data.data.property)) {
    return NextResponse.json({ error: 'The property reference is invalid. Please reload the property page.' }, { status: 400 });
  }

  const message = [
    `Name: ${identity.user.username}`,
    `Email: ${identity.user.email}`,
    `Phone: ${data.data.phone}`,
    `Offer: ${data.data.price} ${data.data.currency}`,
    '',
    data.data.message,
  ].join('\n');
  if (message.length > 3000) {
    return NextResponse.json({ error: 'Please shorten your message and try again.' }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl}/api/me/inquiries`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          message,
          property: data.data.property,
          price: data.data.price,
          currency: data.data.currency,
        },
      }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Unable to reach Strapi property enquiry endpoint.', error);
    return NextResponse.json({ error: 'The enquiry service is temporarily unavailable.' }, { status: 502 });
  }

  if (!upstream.ok) {
    const errorMessage = await getStrapiError(upstream);
    console.error(`Strapi property enquiry failed: ${upstream.status} ${upstream.statusText}${errorMessage ? `: ${errorMessage}` : ''}`);
    if (upstream.status === 409) {
      return NextResponse.json({ error: 'This property is no longer available for reservation.' }, { status: 409 });
    }
    if (upstream.status === 400 || upstream.status === 403) {
      return NextResponse.json(
        { error: errorMessage || 'Strapi rejected this inquiry. Check the fields and Authenticated role inquiry.createMine permission.' },
        { status: upstream.status },
      );
    }
    return NextResponse.json({ error: 'We could not send your message. Please contact us by phone or email.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
