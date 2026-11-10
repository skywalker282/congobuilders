import type { Locale } from './content';

export function localeAlternates(locale: Locale, pathname: string) {
  const suffix = pathname === '/' ? '' : pathname;
  return {
    canonical: `/${locale}${suffix}`,
    languages: {
      en: `/en${suffix}`,
      fr: `/fr${suffix}`,
      'zh-CN': `/zh-CN${suffix}`,
      'x-default': `/en${suffix}`,
    },
  };
}
