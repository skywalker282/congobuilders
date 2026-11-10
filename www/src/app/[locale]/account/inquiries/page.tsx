import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LogoutButton } from '@/components/logout-button';
import { PageIntro } from '@/components/site';
import { getAuthenticatedUser, getMyInquiries, getSessionToken } from '@/lib/strapi-auth';

export const dynamic = 'force-dynamic';

export default async function AccountInquiriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const token = await getSessionToken();
  if (!token) redirect(`/${locale}/login`);

  const [t, identity] = await Promise.all([
    getTranslations('auth'),
    getAuthenticatedUser(token),
  ]);
  if (!identity.ok && identity.status === 401) redirect(`/${locale}/login`);

  const result = identity.ok
    ? await getMyInquiries(token, identity.user)
    : { ok: false as const, status: identity.status };

  return (
    <>
      <PageIntro eyebrow="Congo Builders · Account" title={t('inquiriesTitle')} description={t('inquiriesIntro')} />
      <section className="section section-paper">
        <div className="content-wrap account-layout">
          <div className="account-toolbar">
            {identity.ok && <p>{t('signedInAs')} <strong>{identity.user.email}</strong></p>}
            <LogoutButton />
          </div>
          {!identity.ok || !result.ok ? (
            <p className="form-feedback form-error" role="alert">{t('inquiriesFailure')}</p>
          ) : result.inquiries.length === 0 ? (
            <p className="account-empty">{t('noInquiries')}</p>
          ) : (
            <div className="inquiry-list">
              {result.inquiries.map((inquiry) => (
                <article className="inquiry-card" key={inquiry.id}>
                  <div><span className="eyebrow">{inquiry.date || t('inquiry')}</span><h2>{inquiry.property || t('propertyUnavailable')}</h2></div>
                  <p>{inquiry.message}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
