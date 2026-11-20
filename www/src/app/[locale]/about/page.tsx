import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MemberGrid, PageIntro, SectionHeading } from '@/components/site';
import { localeAlternates } from '@/lib/seo';
import { getMembers } from '@/lib/content';

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });
  return { title: t('about'), description: t('aboutIntro'), alternates: localeAlternates(locale as 'en' | 'fr' | 'zh-CN', '/about') };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const p = await getTranslations('pages');
  const h = await getTranslations('home');
  const a = await getTranslations('about');
  const members = await getMembers();
  return <>
    <PageIntro eyebrow="Congo Builders · Lubumbashi" title={p('about')} description={p('aboutIntro')} />
    <section className="section"><div className="content-wrap about-layout"><SectionHeading eyebrow={h('introEyebrow')} title={h('introTitle')} body={h('introBody')} /><div className="about-prose"><p>{h('whyBody')}</p><p>{h('capabilityBody')}</p><p>{h('contactBody')}</p></div></div></section>
    <section className="section section-paper"><div className="content-wrap"><SectionHeading eyebrow={h('whyEyebrow')} title={h('whyTitle')} body={h('whyBody')} /><div className="principle-grid"><article><span>01</span><h3>{a('qualityTitle')}</h3><p>{a('qualityBody')}</p></article><article><span>02</span><h3>{a('peopleTitle')}</h3><p>{a('peopleBody')}</p></article><article><span>03</span><h3>{a('deliveryTitle')}</h3><p>{a('deliveryBody')}</p></article></div></div></section>
    {members.length > 0 && <section className="section team-section"><div className="content-wrap"><SectionHeading eyebrow={a('teamEyebrow')} title={a('teamTitle')} body={a('teamBody')} /><MemberGrid members={members} /></div></section>}
  </>;
}
