'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { LogoutButton } from '@/components/logout-button';

const navItems = [
  ['about', 'about'],
  ['services', 'services'],
  ['projects', 'projects'],
  ['properties', 'properties'],
  ['contact', 'contact'],
] as const;

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then(async (response) => {
        if (!response.ok) throw new Error(`Account check failed: ${response.status}`);
        return response.json();
      })
      .then((result: { user?: unknown }) => {
        if (active) setAuthenticated(Boolean(result.user));
      })
      .catch((error: unknown) => {
        console.error('Unable to check the current account.', error);
      });
    return () => { active = false; };
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href={`/${locale}`} aria-label="Congo Builders home">
          <Image className="brand-logo" src="/images/logowhite.png" alt="Congo Builders" width={1920} height={1080} priority />
        </Link>
        <button
          className="mobile-menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label={open ? t('close') : t('menu')}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
        <nav id="primary-navigation" className={`main-nav${open ? ' is-open' : ''}`} aria-label={t('mainNav')}>
          {navItems.map(([label, path]) => {
            const href = `/${locale}/${path}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={path} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)} href={href}>{t(label)}</Link>;
          })}
          {authenticated ? (
            <>
              <Link href={`/${locale}/account/inquiries`} onClick={() => setOpen(false)}>{t('account')}</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href={`/${locale}/login`} onClick={() => setOpen(false)}>{t('login')}</Link>
              <Link href={`/${locale}/register`} onClick={() => setOpen(false)}>{t('register')}</Link>
            </>
          )}
          <div className="locale-switcher" aria-label={t('language')}>
            {(['en', 'fr', 'zh-CN'] as const).map((code) => {
              const destination = pathname.replace(/^\/(en|fr|zh-CN)(?=\/|$)/, `/${code}`);
              return <Link key={code} aria-current={locale === code ? 'true' : undefined} href={destination || `/${code}`}>{code === 'zh-CN' ? '中文' : code.toUpperCase()}</Link>;
            })}
          </div>
          <Link className="button button-small button-gold nav-cta" href={`/${locale}/contact`}>{t('contactAction')} <ArrowUpRight size={15} /></Link>
        </nav>
      </div>
    </header>
  );
}
