import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { EmptyProperties, PageIntro } from '@/components/site';
import { localeAlternates } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });
  return { title: t('news'), description: t('newsIntro'), alternates: localeAlternates(locale as 'en' | 'fr' | 'zh-CN', '/news') };
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages');
  const c = await getTranslations('common');
  return <><PageIntro eyebrow="Congo Builders · Updates" title={t('news')} description={t('newsIntro')} /><section className="section section-paper"><div className="content-wrap"><EmptyProperties message={c('noContent')} /></div></section></>;
}
