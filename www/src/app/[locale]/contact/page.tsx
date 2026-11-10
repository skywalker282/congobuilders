import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/contact-form';
import { PageIntro } from '@/components/site';
import { localeAlternates } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });
  return { title: t('contact'), description: t('contactIntro'), alternates: localeAlternates(locale as 'en' | 'fr' | 'zh-CN', '/contact') };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const p = await getTranslations('pages');
  const t = await getTranslations('contact');
  const search = await getTranslations('home');
  return <><PageIntro eyebrow="Congo Builders · Lubumbashi" title={p('contact')} description={p('contactIntro')} /><section className="section section-paper"><div className="content-wrap contact-layout"><div className="contact-details"><span className="eyebrow">{search('contactEyebrow')}</span><h2>{search('contactTitle')}</h2><p>{search('contactBody')}</p><address><div><MapPin size={19} /><span>{t('address')}</span></div><div><Phone size={19} /><span><a href={`tel:${t('phoneOne').replaceAll(' ', '')}`}>{t('phoneOne')}</a><br /><a href={`tel:${t('phoneTwo').replaceAll(' ', '')}`}>{t('phoneTwo')}</a></span></div><div><Mail size={19} /><a href={`mailto:${t('emailAddress')}`}>{t('emailAddress')}</a></div></address><Link className="text-link" href={`https://wa.me/${t('phoneOne').replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={16} /></Link></div><div className="contact-form-wrap"><ContactForm /></div></div></section></>;
}
