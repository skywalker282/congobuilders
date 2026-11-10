import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageIntro, ProjectGrid } from '@/components/site';
import { getProjects, getServices } from '@/lib/content';
import { localeAlternates } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const [services, t] = await Promise.all([
    getServices(),
    getTranslations({ locale, namespace: 'services' }),
  ]);
  const service = services.find((item) => item.slug === slug);
  return service ? {
    title: t.has(service.name) ? t(service.name) : service.name,
    description: service.description,
    alternates: localeAlternates(locale as 'en' | 'fr' | 'zh-CN', `/services/${slug}`),
  } : {};
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [services, projects, labels, nav, common] = await Promise.all([
    getServices(),
    getProjects(),
    getTranslations('services'),
    getTranslations('nav'),
    getTranslations('common'),
  ]);
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();

  const title = labels.has(service.name) ? labels(service.name) : service.name;
  const descriptionKey = `${service.name}Body`;
  const description = labels.has(descriptionKey) ? labels(descriptionKey) : service.description;

  return <>
    <PageIntro eyebrow="Congo Builders · Expertise" title={title} description={description} />
    <section className="section"><div className="content-wrap service-detail-layout"><div className="service-detail-image"><Image src={service.image} alt={title} fill sizes="(max-width: 760px) 100vw, 48vw" className="cover-image" /></div><div className="service-detail-copy"><span className="eyebrow">{nav('services')}</span><h2>{title}</h2><p>{description}</p><Link className="button button-primary" href={`/${locale}/contact`}>{nav('contact')} <ArrowRight size={16} /></Link></div></div></section>
    {projects.length > 0 && <section className="section section-dark"><div className="content-wrap"><div className="split-heading"><h2 className="related-heading related-heading-light">{common('explore')} {nav('projects')}</h2><Link className="text-link text-link-light" href={`/${locale}/projects`}><ArrowLeft size={16} /> {common('viewAll')}</Link></div><ProjectGrid projects={projects.slice(0, 3)} /></div></section>}
  </>;
}
