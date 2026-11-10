import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthForm } from '@/components/auth-form';
import { PageIntro } from '@/components/site';

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');
  return (
    <>
      <PageIntro eyebrow="Congo Builders · Account" title={t('registerTitle')} description={t('registerIntro')} />
      <section className="section section-paper">
        <div className="content-wrap auth-layout">
          <div className="auth-panel"><AuthForm mode="register" /></div>
        </div>
      </section>
    </>
  );
}
