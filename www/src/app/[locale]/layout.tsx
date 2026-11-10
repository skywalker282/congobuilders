import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Footer } from '@/components/site';
import { Header } from '@/components/header';
import '../globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://congo-btp.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const description =
    locale === 'fr'
      ? 'Construction, génie civil et immobilier à Lubumbashi, Haut-Katanga, RD Congo.'
      : locale === 'zh-CN'
        ? '刚果民主共和国卢本巴希的建筑施工、土木工程和房地产服务。'
        : 'Construction, civil engineering and real estate in Lubumbashi, Haut-Katanga, DR Congo.';
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: 'Congo Builders | Building & Innovation',
      template: '%s | Congo Builders',
    },
    description,
    openGraph: {
      type: 'website',
      siteName: 'Congo Builders',
      title: 'Congo Builders | Building & Innovation',
      description,
      locale: locale === 'zh-CN' ? 'zh_CN' : locale,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return <html lang={locale}><body><NextIntlClientProvider messages={messages}><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content">{children}</main><Footer /></NextIntlClientProvider></body></html>;
}
