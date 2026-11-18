import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/contact-form';
import { PropertyCard } from '@/components/site';
import { getProperties, getProperty } from '@/lib/content';
import { localeAlternates } from '@/lib/seo';
import { getAuthenticatedUser, getSessionToken } from '@/lib/strapi-auth';

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = await getProperty(slug);
  if (!property) return {};
  const t = await getTranslations({ locale, namespace: 'properties' });
  return {
    title: property.title,
    description: property.description || `${t('type')}: ${property.type}. ${property.location}`,
    alternates: localeAlternates(locale as 'en' | 'fr' | 'zh-CN', `/properties/${slug}`),
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [property, properties, t, nav, contact] = await Promise.all([
    getProperty(slug),
    getProperties(),
    getTranslations('properties'),
    getTranslations('nav'),
    getTranslations('contact'),
  ]);
  if (!property) notFound();
  const token = await getSessionToken();
  const identity = token ? await getAuthenticatedUser(token) : undefined;
  const similar = properties.filter((item) => item.slug !== property.slug && item.transaction === property.transaction).slice(0, 3);
  const reservable = property.availability === 'AVAILABLE';
  const availabilityLabels: Record<string, string> = {
    AVAILABLE: t('available'),
    RESERVED: t('reserved'),
    RENTED: t('rented'),
    SOLD: t('sold'),
  };
  const availabilityLabel = availabilityLabels[property.availability] ?? property.availability;
  const price = property.price == null
    ? t('priceOnRequest')
    : new Intl.NumberFormat(locale, { style: 'currency', currency: property.currency || 'USD', maximumFractionDigits: 0 }).format(property.price);

  return <>
    <article className="property-detail">
      <div className="property-detail-image">{property.image ? <Image src={property.image} alt={property.title} fill priority sizes="100vw" className="cover-image" /> : <span className="property-image-placeholder" aria-hidden="true">CB</span>}<Link className="back-link back-link-overlay" href={`/${locale}/properties`}><ArrowLeft size={16} /> {nav('properties')}</Link><span className="property-tag">{property.transaction === 'RENT' ? nav('rent') : nav('buy')}</span></div>
      <div className="content-wrap property-detail-layout">
        <div className="property-detail-main"><span className="eyebrow">{property.type}</span><h1>{property.title}</h1><p className="property-detail-location">{property.location || property.address}</p><div className="property-detail-specs">{property.bedrooms != null && <span>{property.bedrooms} {t('bed')}</span>}{property.bathrooms != null && <span>{property.bathrooms} {t('bath')}</span>}{property.area != null && <span>{property.area} {t('area')}</span>}<span>{t('availability')}: {availabilityLabel}</span></div><h2>{t('description')}</h2><p>{property.description}</p></div>
        <aside className="property-enquiry"><strong className="property-detail-price">{price}{property.period && <small> / {property.period.toLowerCase()}</small>}</strong><h2>{t('reserve')}</h2><p>{contact('phoneOne')}<br /><a href={`mailto:${contact('emailAddress')}`}>{contact('emailAddress')}</a></p>{reservable ? <a className="button button-primary" href="#property-enquiry-form">{t('reserve')} <ArrowUpRight size={16} /></a> : <><button className="button button-primary" type="button" disabled>{t('reserve')}</button><p className="form-feedback">{t('reservationUnavailable')}</p></>}</aside>
      </div>
    </article>
    <section className="section section-paper"><div className="content-wrap"><div className="form-section-heading"><span className="eyebrow">Congo Builders · Property</span><h2>{t('reserve')}</h2></div>{reservable ? <ContactForm property={property.id} booking={identity?.ok ? { customerId: identity.user.id, customerEmail: identity.user.email, propertyName: property.title, date: new Date().toISOString().slice(0, 10), status: 'pending' } : undefined} authenticated={identity?.ok ?? false} returnTo={`/${locale}/properties/${slug}#property-enquiry-form`} /> : <p className="form-feedback">{t('reservationUnavailable')}</p>}</div></section>
    {similar.length > 0 && <section className="section"><div className="content-wrap"><h2 className="related-heading">{t('similar')}</h2><div className="property-grid">{similar.map((item) => <PropertyCard key={item.id} property={item} />)}</div></div></section>}
  </>;
}
