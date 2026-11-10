import 'server-only';
import { getLocale } from 'next-intl/server';

export const locales = ['en', 'fr', 'zh-CN'] as const;
export type Locale = (typeof locales)[number];

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  description: string;
  location?: string;
  customer?: string;
  image: string;
  featured?: boolean;
};

export type Property = {
  id: string;
  slug: string;
  title: string;
  address: string;
  location: string;
  type: string;
  transaction: 'RENT' | 'SALE';
  availability: string;
  price?: number;
  currency?: 'USD' | 'CDF';
  period?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  description: string;
  image?: string;
};

export type Testimonial = {
  id: string;
  customer: string;
  title?: string;
  content: string;
};

type StrapiRecord = Record<string, unknown> & {
  id?: number | string;
  documentId?: string;
  attributes?: Record<string, unknown>;
};

const image = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

const serviceImages = [
  image('323780'),
  image('4346254'),
  image('209251'),
  image('834892'),
  image('257700'),
  image('323705'),
];

export type Service = {
  slug: string;
  name: string;
  description: string;
  image: string;
};

const serviceDefinitions = [
  ['construction', 'Villas, apartment buildings, and commercial and industrial buildings.'],
  ['civil', 'Roads, drainage channels, paving and slabs, retaining walls, and sanitation.'],
  ['renovation', 'Tiling, painting, ceilings, roofing, and carpentry.'],
  ['studies', 'Architectural plans, quantity estimates, and complete project supervision.'],
  ['electricity', 'Domestic electrical installations and solar energy.'],
  ['realEstate', 'Find published rental and sale listings or speak with our property team.'],
] as const;

export const fallbackServices: Service[] = serviceDefinitions.map(([slug, description], index) => ({
  slug,
  name: slug,
  description,
  image: serviceImages[index],
}));

export const fallbackProjects: Project[] = [
  {
    id: 'reference-residential',
    slug: 'residential-construction',
    title: 'Residential construction',
    category: 'RESIDENTIAL',
    status: 'COMPLETED',
    description: 'A project reference for residential construction and finishing capabilities.',
    location: 'Lubumbashi, Haut-Katanga',
    image: image('323780'),
  },
  {
    id: 'reference-civil',
    slug: 'civil-engineering',
    title: 'Civil engineering works',
    category: 'CIVIL ENGINEERING',
    status: 'ONGOING',
    description: 'A project reference representing roads, drainage, paving, and site works.',
    location: 'Haut-Katanga',
    image: image('2079246'),
  },
  {
    id: 'reference-commercial',
    slug: 'commercial-building',
    title: 'Commercial building',
    category: 'COMMERCIAL',
    status: 'PLANNED',
    description: 'A project reference for commercial construction and site supervision.',
    location: 'Lubumbashi, Haut-Katanga',
    image: image('209251'),
  },
];

const apiBase = (process.env.STRAPI_API_URL || 'https://buildersapi.salemcapital.cd')
  .replace(/\/+$/, '');

function extractRecords(payload: unknown): StrapiRecord[] {
  if (!payload || typeof payload !== 'object') return [];
  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is StrapiRecord => !!item && typeof item === 'object');
}

function fields(record: StrapiRecord): Record<string, unknown> {
  const { attributes, ...rest } = record;
  return attributes && typeof attributes === 'object'
    ? { ...rest, ...attributes }
    : rest;
}

function text(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value
      .map((block) => {
        if (!block || typeof block !== 'object') return '';
        const children = (block as { children?: unknown[] }).children;
        return Array.isArray(children)
          ? children.map((child) =>
              child && typeof child === 'object' && 'text' in child
                ? String(child.text)
                : '',
            ).join('')
          : '';
      })
      .filter(Boolean)
      .join('\n\n');
  }
  return '';
}

function mediaUrl(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  if (!first || typeof first !== 'object') return undefined;
  const media = first as { url?: unknown; data?: unknown };
  if (typeof media.url === 'string') return media.url;
  const nested = Array.isArray(media.data) ? media.data[0] : media.data;
  if (!nested || typeof nested !== 'object') return undefined;
  const item = nested as { url?: unknown; attributes?: { url?: unknown } };
  const url = item.url ?? item.attributes?.url;
  if (typeof url !== 'string') return undefined;
  return url.startsWith('/') ? `${apiBase}${url}` : url;
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getCollection(path: string, tags: string): Promise<StrapiRecord[]> {
  const token = process.env.STRAPI_API_TOKEN;
  const locale = await getLocale();
  const separator = path.includes('?') ? '&' : '?';
  try {
    const response = await fetch(`${apiBase}/api/${path}${separator}locale=${encodeURIComponent(locale)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      next: { revalidate: 300, tags: [tags] },
    });

    if (!response.ok) {
      console.error(`Strapi ${path} request failed: ${response.status} ${response.statusText}`);
      return [];
    }
    return extractRecords(await response.json());
  } catch (error) {
    console.error(`Unable to load ${path} from Strapi.`, error);
    return [];
  }
}

export async function getServices(): Promise<Service[]> {
  const records = await getCollection('services?populate=*&pagination[pageSize]=100', 'services');
  if (!records.length) return fallbackServices;

  const services = records.flatMap((record, index) => {
    const data = fields(record);
    const name = text(data.name ?? data.title);
    if (!name) return [];
    return {
      slug: text(data.slug) || slugify(name),
      name,
      description: text(data.description),
      image: mediaUrl(data.cover ?? data.image) || serviceImages[index % serviceImages.length],
    };
  });
  return services.length ? services : fallbackServices;
}

export async function getProjects(): Promise<Project[]> {
  const records = await getCollection('projects?populate=*&pagination[pageSize]=100', 'projects');
  if (!records.length) return fallbackProjects;

  const projects = records.flatMap((record, index) => {
    const data = fields(record);
    const title = text(data.title ?? data.name);
    if (!title) return [];
    const cover = mediaUrl(data.cover) || mediaUrl(data.images);
    const status = text(data.status ?? data.advancement) || 'ONGOING';
    return {
      id: String(data.documentId ?? data.id ?? index),
      slug: text(data.slug) || slugify(title),
      title,
      category: text(data.category) || 'PROJECT',
      status,
      description: text(data.description),
      location: text(data.location) || undefined,
      customer: text(data.customer) || undefined,
      image: cover || fallbackProjects[index % fallbackProjects.length].image,
      featured: Boolean(data.featured),
    };
  });
  return projects.length ? projects : fallbackProjects;
}

export async function getProperties(): Promise<Property[]> {
  const records = await getCollection(
    'properties?filters[availability][$eq]=AVAILABLE&populate=*&pagination[pageSize]=100',
    'properties',
  );

  return records.flatMap((record, index) => {
    const data = fields(record);
    const title = text(data.name ?? data.title);
    const transaction = text(data.transaction).toUpperCase();
    const availability = text(data.availability).toUpperCase();
    if (!title || !['RENT', 'SALE'].includes(transaction) || availability !== 'AVAILABLE') {
      return [];
    }

    const town = text(data.town);
    const neighborhood = text(data.neighborhood);
    const location = [neighborhood, town, text(data.province)].filter(Boolean).join(', ');
    const images = data.images;
    return [{
      id: String(data.documentId ?? data.id ?? index),
      slug: text(data.slug) || slugify(title),
      title,
      address: text(data.address),
      location,
      type: text(data.type).toUpperCase() || 'OTHER',
      transaction: transaction as Property['transaction'],
      availability,
      price: typeof data.price === 'number' ? data.price : undefined,
      currency: data.currency === 'CDF' ? 'CDF' : data.currency === 'USD' ? 'USD' : undefined,
      period: text(data.period) || undefined,
      bedrooms: typeof data.bedrooms === 'number' ? data.bedrooms : undefined,
      bathrooms: typeof data.bathrooms === 'number' ? data.bathrooms : undefined,
      area: typeof data.surfaceArea === 'number' ? data.surfaceArea : undefined,
      description: text(data.description),
      image: mediaUrl(images),
    }];
  });
}

export async function getProperty(slug: string): Promise<Property | undefined> {
  const properties = await getProperties();
  return properties.find((property) => property.slug === slug);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const records = await getCollection(
    'testimonials?pagination[pageSize]=6&sort[0]=id:desc',
    'testimonials',
  );
  return records.flatMap((record, index) => {
    const data = fields(record);
    const customer = text(data.customer);
    const content = text(data.content);
    if (!customer || !content) return [];
    return [{
      id: String(data.documentId ?? data.id ?? index),
      customer,
      title: text(data.title) || undefined,
      content,
    }];
  });
}
