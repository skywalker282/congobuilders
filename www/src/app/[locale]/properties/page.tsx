import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EmptyProperties, PageIntro, PropertyCard, PropertyFilter } from '@/components/site';
import { getProperties } from '@/lib/content';
import { localeAlternates } from '@/lib/seo';

export const revalidate = 120;

type Search = Record<string, string | string[] | undefined>;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });
  return { title: t('properties'), description: t('propertiesIntro'), alternates: localeAlternates(locale as 'en' | 'fr' | 'zh-CN', '/properties') };
}

export default async function PropertiesPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Search> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const value = (key: string) => {
    const entry = query[key];
    return typeof entry === 'string' ? entry : '';
  };
  const p = await getTranslations('pages');
  const t = await getTranslations('properties');
  const c = await getTranslations('common');
  const activeFilters = [
    value('transaction') && [t('transaction'), value('transaction') === 'RENT' ? t('rent') : t('sale')],
    value('type') && [t('type'), t.has(value('type').toLowerCase()) ? t(value('type').toLowerCase()) : value('type')],
    value('location') && [t('location'), value('location')],
    value('min') && [t('minPrice'), value('min')],
    value('max') && [t('maxPrice'), value('max')],
    value('bedrooms') && [t('bedrooms'), value('bedrooms')],
    value('bathrooms') && [t('bathrooms'), value('bathrooms')],
  ].filter((item): item is [string, string] => Array.isArray(item));
  const properties = (await getProperties()).filter((item) =>
    (!value('transaction') || item.transaction === value('transaction')) &&
    (!value('type') || item.type === value('type')) &&
    (!value('location') || `${item.address} ${item.location}`.toLowerCase().includes(value('location').toLowerCase())) &&
    (!value('min') || (item.price != null && item.price >= Number(value('min')))) &&
    (!value('max') || (item.price != null && item.price <= Number(value('max')))) &&
    (!value('bedrooms') || (item.bedrooms != null && item.bedrooms >= Number(value('bedrooms')))) &&
    (!value('bathrooms') || (item.bathrooms != null && item.bathrooms >= Number(value('bathrooms')))),
  );
  const pageSize = 9;
  const requestedPage = Math.max(1, Number(value('page')) || 1);
  const pageCount = Math.max(1, Math.ceil(properties.length / pageSize));
  const currentPage = Math.min(requestedPage, pageCount);
  const visible = properties.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, entry] of Object.entries(query)) {
      if (key !== 'page' && typeof entry === 'string' && entry) params.set(key, entry);
    }
    params.set('page', String(page));
    return `?${params}`;
  };

  return <><PageIntro eyebrow="Congo Builders · Property" title={p('properties')} description={p('propertiesIntro')} /><section className="section section-paper"><div className="content-wrap"><PropertyFilter basePath={`/${locale}/properties`} values={{ transaction: value('transaction'), type: value('type'), location: value('location'), min: value('min'), max: value('max'), bedrooms: value('bedrooms'), bathrooms: value('bathrooms') }} /><div className="results-heading"><span>{properties.length} {t('results')}</span>{activeFilters.length > 0 && <div className="active-filter-list">{activeFilters.map(([label, filter]) => <span className="active-filter" key={label}>{label}: {filter}</span>)}</div>}</div>{visible.length ? <div className="property-grid">{visible.map((property) => <PropertyCard property={property} key={property.id} />)}</div> : <EmptyProperties message={c('noResults')} />}{pageCount > 1 && <nav className="pagination" aria-label="Pagination">{currentPage > 1 && <a href={pageHref(currentPage - 1)}>{c('previous')}</a>}<span>{c('page')} {currentPage} {c('of')} {pageCount}</span>{currentPage < pageCount && <a href={pageHref(currentPage + 1)}>{c('next')}</a>}</nav>}</div></section></>;
}
