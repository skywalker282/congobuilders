'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export function LogoutButton() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();

  async function logout() {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (!response.ok) {
      console.error(`Sign-out failed: ${response.status} ${response.statusText}`);
      return;
    }
    router.replace(`/${locale}/login`);
    router.refresh();
  }

  return <button className="button button-small button-outline" type="button" onClick={logout}>{t('logout')}</button>;
}
