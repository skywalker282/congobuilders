import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, MoveUpRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getProjects, getProperties, getServices, getTestimonials } from '@/lib/content';
import { localeAlternates } from '@/lib/seo';
import { Hero, ProjectGrid, PropertyCard, SectionHeading, ServiceGrid, TestimonialList } from '@/components/site';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: 'Construction, Engineering & Real Estate',
    description: t('intro'),
    alternates: localeAlternates(locale as 'en' | 'fr' | 'zh-CN', '/'),
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const c = await getTranslations('common');
  const n = await getTranslations('nav');
  const [services, projects, properties, testimonials] = await Promise.all([
    getServices(),
    getProjects(),
    getProperties(),
    getTestimonials(),
  ]);

  return <>
    <Hero eyebrow={t('eyebrow')} title={t('title')} intro={t('intro')} primary={t('primary')} secondary={t('secondary')} />
    <section className="intro-section content-wrap" id="introduction">
      <div className="intro-image"><Image src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Modern building architecture" fill sizes="(max-width: 760px) 100vw, 48vw" className="cover-image" /><span className="image-index">CB / 01</span></div>
      <div className="intro-copy"><span className="eyebrow">{t('introEyebrow')}</span><h2>{t('introTitle')}</h2><p>{t('introBody')}</p><ul className="check-list"><li><Check size={17} />{t('qualityPoint')}</li><li><Check size={17} />{t('teamPoint')}</li><li><Check size={17} />{t('deliveryPoint')}</li></ul><Link className="text-link" href={`/${locale}/about`}>{c('learnMore')} <ArrowRight size={17} /></Link></div>
      <span className="intro-vertical-label">CONGO BUILDERS · LUBUMBASHI</span>
    </section>
    <section className="section section-paper"><div className="content-wrap"><SectionHeading eyebrow={t('servicesEyebrow')} title={t('servicesTitle')} /><ServiceGrid services={services} limit={6} /><div className="section-action"><Link className="text-link" href={`/${locale}/services`}>{c('viewAll')} {n('services')} <ArrowRight size={17} /></Link></div></div></section>
    <section className="section section-dark"><div className="content-wrap"><div className="split-heading"><SectionHeading eyebrow={t('projectsEyebrow')} title={t('projectsTitle')} light /><Link className="text-link text-link-light" href={`/${locale}/projects`}>{c('viewAll')} {n('projects')} <ArrowRight size={17} /></Link></div><ProjectGrid projects={projects} limit={3} /></div><div className="dark-geometry" aria-hidden="true" /></section>
    <section className="property-feature content-wrap"><div className="property-feature-copy"><span className="eyebrow">{t('propertyEyebrow')}</span><h2>{t('propertyTitle')}</h2><p>{t('propertyClaim')}</p><p>{t('propertyBody')}</p><div className="property-shortcuts"><Link className="button button-primary" href={`/${locale}/properties/rent`}>{n('rent')} <ArrowUpRight size={16} /></Link><Link className="button button-outline" href={`/${locale}/properties/buy`}>{n('buy')} <ArrowUpRight size={16} /></Link></div></div><div className="property-preview">{properties.slice(0, 2).map((property) => <PropertyCard property={property} key={property.id} />)}{properties.length === 0 && <div className="property-feature-empty"><span className="eyebrow">{t('propertyEyebrow')}</span><p>{t('propertyEmpty')}</p><Link className="text-link" href={`/${locale}/contact`}>{t('cta')} <ArrowRight size={17} /></Link></div>}</div><Link className="property-feature-link" href={`/${locale}/properties`} aria-label={n('properties')}><MoveUpRight size={20} /></Link></section>
    <section className="section capabilities"><div className="content-wrap capability-layout"><div><span className="eyebrow">{t('whyEyebrow')}</span><h2>{t('whyTitle')}</h2><p>{t('whyBody')}</p></div><div className="capability-panel"><span className="eyebrow eyebrow-gold">{t('capabilityEyebrow')}</span><h3>{t('capabilityTitle')}</h3><p>{t('capabilityBody')}</p><Link className="text-link text-link-light" href={`/${locale}/contact`}>{t('cta')} <ArrowRight size={17} /></Link><span className="capability-number">01<span>/</span>04</span></div></div></section>
    <section className="section section-paper"><div className="content-wrap"><SectionHeading eyebrow={t('testimonialEyebrow')} title={t('testimonialTitle')} body={testimonials.length ? undefined : t('testimonialBody')} />{testimonials.length > 0 && <TestimonialList testimonials={testimonials} />}</div></section>
    <section className="cta-section"><div className="cta-geometric" aria-hidden="true" /><div className="content-wrap cta-inner"><span className="eyebrow eyebrow-gold">{t('contactEyebrow')}</span><h2>{t('contactTitle')}</h2><p>{t('contactBody')}</p><Link className="button button-gold" href={`/${locale}/contact`}>{t('cta')} <ArrowRight size={17} /></Link></div></section>
  </>;
}
