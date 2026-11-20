'use server';

import { getMyInquiries, getSessionToken, getStrapiApiUrl } from '@/lib/strapi-auth';

type ActionResult = { ok: true } | { ok: false; error: string };
type InquiryAccess =
  | { ok: true; id: string; apiUrl: string; sessionToken: string }
  | { ok: false; error: string };

async function getPendingInquiryAccess(id: string): Promise<InquiryAccess> {
  const inquiryId = id.trim();
  if (!inquiryId || inquiryId.length > 128) {
    return { ok: false, error: 'This inquiry could not be found.' };
  }

  const sessionToken = await getSessionToken();
  if (!sessionToken) return { ok: false, error: 'Please sign in again.' };

  const result = await getMyInquiries(sessionToken);
  if (!result.ok) {
    return {
      ok: false,
      error: result.status === 401
        ? 'Please sign in again.'
        : 'Your inquiries are temporarily unavailable.',
    };
  }

  const inquiry = result.inquiries.find((item) => item.id === inquiryId);
  if (!inquiry || inquiry.progress !== 'pending') {
    return { ok: false, error: 'Only your pending inquiries can be changed.' };
  }

  const apiUrl = getStrapiApiUrl();
  if (!apiUrl) {
    console.error('Inquiry editing and deletion require a valid STRAPI_API_URL.');
    return { ok: false, error: 'Inquiry editing is not configured. Please contact us.' };
  }

  return { ok: true, id: inquiryId, apiUrl, sessionToken };
}

async function getStrapiError(response: Response, action: string): Promise<string> {
  const payload: unknown = await response.json().catch(() => null);
  const message =
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    payload.error &&
    typeof payload.error === 'object' &&
    'message' in payload.error &&
    typeof payload.error.message === 'string'
      ? payload.error.message
      : undefined;
  console.error(`Strapi inquiry ${action} failed: ${response.status} ${response.statusText}${message ? `: ${message}` : ''}`);
  return message || `We could not ${action} this inquiry. Please try again.`;
}

export async function updateMyInquiry(
  id: string,
  message: string,
  price: number,
  currency: 'USD' | 'CDF',
): Promise<ActionResult> {
  const normalizedMessage = message.trim();
  if (normalizedMessage.length < 10 || normalizedMessage.length > 3000) {
    return { ok: false, error: 'The message must be between 10 and 3,000 characters.' };
  }
  if (!Number.isSafeInteger(price) || price < 0) {
    return { ok: false, error: 'The offer price must be a valid non-negative integer.' };
  }
  if (currency !== 'USD' && currency !== 'CDF') {
    return { ok: false, error: 'Please choose USD or CDF.' };
  }

  const access = await getPendingInquiryAccess(id);
  if (!access.ok) return access;

  let response: Response;
  try {
    response = await fetch(`${access.apiUrl}/api/inquiries/${encodeURIComponent(access.id)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${access.sessionToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          message: normalizedMessage,
          price,
          currency,
        },
      }),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Unable to reach Strapi to update an inquiry.', error);
    return { ok: false, error: 'The inquiry service is temporarily unavailable.' };
  }

  if (!response.ok) return { ok: false, error: await getStrapiError(response, 'update') };
  return { ok: true };
}

export async function deleteMyInquiry(id: string): Promise<ActionResult> {
  const access = await getPendingInquiryAccess(id);
  if (!access.ok) return access;

  let response: Response;
  try {
    response = await fetch(`${access.apiUrl}/api/inquiries/${encodeURIComponent(access.id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${access.sessionToken}` },
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Unable to reach Strapi to delete an inquiry.', error);
    return { ok: false, error: 'The inquiry service is temporarily unavailable.' };
  }

  if (!response.ok) return { ok: false, error: await getStrapiError(response, 'delete') };
  return { ok: true };
}
