'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const response = await fetch(mode === 'login' ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof payload.error === 'string' ? payload.error : t('failure'));
        return;
      }
      router.replace(`/${locale}/account/inquiries`);
      router.refresh();
    } catch (submissionError) {
      console.error('Unable to submit the account form.', submissionError);
      setError(t('failure'));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="contact-form auth-form" onSubmit={submit}>
      {mode === 'register' ? (
        <>
          <label>{t('username')}<input name="username" required minLength={3} maxLength={50} autoComplete="username" pattern="[A-Za-z0-9._-]+" /></label>
          <label>{t('email')}<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
          <label>{t('password')}<input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" /></label>
        </>
      ) : (
        <>
          <label>{t('identifier')}<input name="identifier" required maxLength={254} autoComplete="username" /></label>
          <label>{t('password')}<input name="password" type="password" required maxLength={128} autoComplete="current-password" /></label>
        </>
      )}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? t('submitting') : mode === 'login' ? t('login') : t('register')}
      </button>
      {error && <p className="form-feedback form-error" role="alert">{error}</p>}
    </form>
  );
}
