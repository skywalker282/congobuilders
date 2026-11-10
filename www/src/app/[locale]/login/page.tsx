import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthForm } from '@/components/auth-form';
import { PageIntro } from '@/components/site';

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');
  return (
    <>
      <PageIntro eyebrow="Congo Builders · Account" title={t('loginTitle')} description={t('loginIntro')} />
      <section className="section section-paper">
        <div className="content-wrap auth-layout">
          <div className="auth-panel"><AuthForm mode="login" /></div>
        </div>
      </section>
    </>
  );
}
