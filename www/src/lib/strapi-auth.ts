import 'server-only';
import { cookies } from 'next/headers';

const defaultApiUrl = 'https://buildersapi.salemcapital.cd';
export const authCookieName = 'congo-builders-session';

export function getStrapiApiUrl(): string | undefined {
  const configuredUrl = process.env.STRAPI_API_URL?.trim() || defaultApiUrl;
  try {
    const url = new URL(configuredUrl);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
      return undefined;
    }
    return url.toString().replace(/\/+$/, '');
  } catch {
    return undefined;
  }
}

export type AuthUser = {
  id: number;
  documentId?: string;
  username: string;
  email: string;
};

export type UserInquiry = {
  id: string;
  date: string;
  message: string;
  property: string;
  status: string;
  price: number | null;
  currency: 'USD' | 'CDF' | null;
};

type StrapiRecord = Record<string, unknown> & {
  id?: number | string;
  documentId?: string;
  attributes?: Record<string, unknown>;
};

function recordFields(record: StrapiRecord): Record<string, unknown> {
  return record.attributes ? { ...record, ...record.attributes } : record;
}

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(authCookieName)?.value;
}

export async function getAuthenticatedUser(token: string): Promise<
  | { ok: true; user: AuthUser }
  | { ok: false; status: number }
> {
  const apiUrl = getStrapiApiUrl();
  if (!apiUrl) {
    console.error('STRAPI_API_URL must be an absolute HTTP(S) URL.');
    return { ok: false, status: 502 };
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Unable to verify the Strapi user session.', error);
    return { ok: false, status: 502 };
  }

  if (!response.ok) {
    console.error(`Strapi user-session verification failed: ${response.status} ${response.statusText}`);
    return { ok: false, status: response.status === 401 ? 401 : 502 };
  }

  let user: unknown;
  try {
    user = await response.json();
  } catch (error) {
    console.error('Strapi returned an invalid user-session response.', error);
    return { ok: false, status: 502 };
  }

  if (
    !user ||
    typeof user !== 'object' ||
    !('id' in user) ||
    !('username' in user) ||
    !('email' in user) ||
    typeof user.id !== 'number' ||
    typeof user.username !== 'string' ||
    typeof user.email !== 'string'
  ) {
    console.error('Strapi returned incomplete user-session data.');
    return { ok: false, status: 502 };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      documentId: 'documentId' in user && typeof user.documentId === 'string' ? user.documentId : undefined,
      username: user.username,
      email: user.email,
    },
  };
}

export async function getMyInquiries(token: string): Promise<
  | { ok: true; inquiries: UserInquiry[] }
  | { ok: false; status: number }
> {
  const apiUrl = getStrapiApiUrl();
  if (!apiUrl) {
    console.error('STRAPI_API_URL must be an absolute HTTP(S) URL.');
    return { ok: false, status: 502 };
  }

  let response: Response;
  try {
    response = await fetch(`${apiUrl}/api/me/inquiries`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Unable to load the current user inquiries from Strapi.', error);
    return { ok: false, status: 502 };
  }

  if (!response.ok) {
    console.error(`Strapi current user inquiry request failed: ${response.status} ${response.statusText}`);
    return { ok: false, status: response.status === 401 ? 401 : 502 };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    console.error('Strapi returned an invalid current user inquiry response.', error);
    return { ok: false, status: 502 };
  }

  if (!payload || typeof payload !== 'object') {
    console.error('Strapi returned an unexpected current user response shape.');
    return { ok: false, status: 502 };
  }

  const relationData =
    'data' in payload && payload.data && typeof payload.data === 'object' && 'data' in payload.data
      ? payload.data.data
      : 'data' in payload
        ? payload.data
        : undefined;
  if (!Array.isArray(relationData)) {
    console.error('Strapi returned an unexpected current user inquiry list.');
    return { ok: false, status: 502 };
  }

  const byDocument = new Map<string, UserInquiry>();
  for (const item of relationData) {
    if (!item || typeof item !== 'object') continue;
    const record = recordFields(item as StrapiRecord);
    const propertyValue = record.property;
    const propertyRecord =
      propertyValue && typeof propertyValue === 'object'
        ? (propertyValue as { data?: unknown }).data ?? propertyValue
        : undefined;
    const property =
      propertyRecord && typeof propertyRecord === 'object'
        ? recordFields(propertyRecord as StrapiRecord)
        : {};

    const id = String(record.documentId ?? record.id ?? '');
    if (!id) continue;
    byDocument.set(id, {
      id,
      date: typeof record.date === 'string' ? record.date : '',
      message: typeof record.message === 'string' ? record.message : '',
      property: typeof property.name === 'string' ? property.name : '',
      status: typeof record.status === 'string' ? record.status : 'pending',
      price: typeof record.price === 'number' && Number.isInteger(record.price) && record.price >= 0
        ? record.price
        : null,
      currency: record.currency === 'USD' || record.currency === 'CDF' ? record.currency : null,
    });
  }

  return { ok: true, inquiries: [...byDocument.values()] };
}
