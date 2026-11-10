import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageIntro, ServiceGrid } from '@/components/site';
import { getServices } from '@/lib/content';
import { localeAlternates } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });
  return { title: t('services'), description: t('servicesIntro'), alternates: localeAlternates(locale as 'en' | 'fr' | 'zh-CN', '/services') };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages');
  const services = await getServices();
  return <><PageIntro eyebrow="Congo Builders · Expertise" title={t('services')} description={t('servicesIntro')} /><section className="section section-paper"><div className="content-wrap"><ServiceGrid services={services} /></div></section></>;
}
