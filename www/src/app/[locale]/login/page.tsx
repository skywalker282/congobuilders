import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthForm } from '@/components/auth-form';
import { PageIntro } from '@/components/site';

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const { locale } = await params;
  const { returnTo } = await searchParams;
  const returnToPath = typeof returnTo === 'string' ? returnTo : undefined;
  setRequestLocale(locale);
  const t = await getTranslations('auth');
  return (
    <>
      <PageIntro eyebrow="Congo Builders · Account" title={t('loginTitle')} description={t('loginIntro')} />
      <section className="section section-paper">
        <div className="content-wrap auth-layout">
          <div className="auth-panel"><AuthForm mode="login" returnTo={returnToPath} /></div>
        </div>
      </section>
    </>
  );
}
