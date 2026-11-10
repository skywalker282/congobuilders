import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getProjects } from '@/lib/content';
import { localeAlternates } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = (await getProjects()).find((item) => item.slug === slug);
  return project ? {
    title: project.title,
    description: project.description,
    alternates: localeAlternates(locale as 'en' | 'fr' | 'zh-CN', `/projects/${slug}`),
  } : {};
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [projects, t, nav] = await Promise.all([
    getProjects(),
    getTranslations('common'),
    getTranslations('nav'),
  ]);
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  return <article className="detail-page">  <div className="detail-hero"><Image src={project.image} alt={project.title} fill priority sizes="100vw" className="cover-image" /><div className="detail-hero-shade" /><div className="detail-hero-copy"><Link className="back-link" href={`/${locale}/projects`}><ArrowLeft size={16} /> {t('viewAll')} {nav('projects')}</Link><span className="eyebrow eyebrow-gold">{project.category}</span><h1>{project.title}</h1></div></div><div className="content-wrap detail-content"><div><span className="eyebrow">{project.status}</span><p className="detail-description">{project.description || project.title}</p></div><dl className="detail-facts">{project.location && <div><dt>Location</dt><dd>{project.location}</dd></div>}{project.customer && <div><dt>Client</dt><dd>{project.customer}</dd></div>}</dl></div></article>;
}
