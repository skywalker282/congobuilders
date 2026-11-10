import 'server-only';
import { cookies } from 'next/headers';

const apiUrl = (process.env.STRAPI_API_URL || 'https://buildersapi.salemcapital.cd').replace(/\/+$/, '');
export const authCookieName = 'congo-builders-session';

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

export async function getMyInquiries(token: string, user: AuthUser): Promise<
  | { ok: true; inquiries: UserInquiry[] }
  | { ok: false; status: number }
> {
  const params = new URLSearchParams({
    'populate[inquiries][populate][property]': 'true',
  });
  let response: Response;
  try {
    response = await fetch(`${apiUrl}/api/users/me?${params}`, {
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

  const currentUser = 'data' in payload && payload.data && typeof payload.data === 'object'
    ? payload.data as Record<string, unknown>
    : payload as Record<string, unknown>;
  if (!('id' in currentUser) || String(currentUser.id) !== String(user.id)) {
    console.error('Strapi returned inquiry data for a different user session.');
    return { ok: false, status: 502 };
  }
  if (!('inquiries' in currentUser)) {
    console.error('Strapi omitted the current user inquiries relation.');
    return { ok: false, status: 502 };
  }

  const relation = currentUser.inquiries;
  const relationData =
    relation && typeof relation === 'object' && 'data' in relation
      ? relation.data
      : relation;
  if (!Array.isArray(relationData)) {
    console.error('Strapi returned an unexpected current user inquiries relation.');
    return { ok: false, status: 502 };
  }

  const byDocument = new Map<string, UserInquiry>();
  for (const item of relationData) {
    if (!item || typeof item !== 'object') continue;
    const record = recordFields(item as StrapiRecord);
    if ('publishedAt' in record && record.publishedAt === null) continue;
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
    });
  }

  return { ok: true, inquiries: [...byDocument.values()] };
}
