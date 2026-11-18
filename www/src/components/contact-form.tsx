'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

type Status = 'idle' | 'sending' | 'success' | 'error';

export function ContactForm({
  property,
  booking,
  authenticated = false,
  returnTo,
}: {
  property?: string;
  booking?: {
    customerId: number;
    customerEmail: string;
    propertyName: string;
    date: string;
    status: 'pending';
  };
  authenticated?: boolean;
  returnTo?: string;
}) {
  const t = useTranslations('contact');
  const p = useTranslations('properties');
  const a = useTranslations('auth');
  const locale = useLocale();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setError('');
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch(property ? '/api/property-enquiries' : '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          property,
          ...(property && booking ? { customer: booking.customerId } : {}),
        }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(typeof result.error === 'string' ? result.error : t('failure'));
      }
      form.reset();
      setStatus('success');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : t('failure'));
      setStatus('error');
    }
  }

  if (property && !authenticated) {
    const destination = returnTo && returnTo.startsWith(`/${locale}/`) && !returnTo.includes('\\')
      ? returnTo
      : `/${locale}/properties`;
    const query = `?returnTo=${encodeURIComponent(destination)}`;
    return <div className="contact-form" id="property-enquiry-form">
      <p>{a('bookingSignInPrompt')}</p>
      <div className="button-row">
        <Link className="button button-primary" href={`/${locale}/login${query}`}>{a('login')}</Link>
        <Link className="button button-outline" href={`/${locale}/register${query}`}>{a('register')}</Link>
      </div>
    </div>;
  }

  return <form className="contact-form" id={property ? 'property-enquiry-form' : undefined} onSubmit={submit}>
    <div className="form-grid">
      {property && booking && <>
        <input type="hidden" name="customer" value={booking.customerId} />
        <input type="hidden" name="property" value={property} />
        <input type="hidden" name="status" value={booking.status} />
        <label>{a('bookingCustomer')}<input value={booking.customerEmail} readOnly /></label>
        <label>{a('bookingDate')}<input type="date" name="date" value={booking.date} readOnly /></label>
        <label>{a('bookingStatus')}<input value={a('statusPending')} readOnly /></label>
        <label>{a('bookingProperty')}<input value={booking.propertyName} readOnly /></label>
        <label>{a('bookingPrice')}<input name="price" type="number" min="0" max={Number.MAX_SAFE_INTEGER} step="1" required /></label>
        <label>{a('bookingCurrency')}<select name="currency" defaultValue="" required><option value="" disabled>{a('selectCurrency')}</option><option value="USD">USD</option><option value="CDF">CDF</option></select></label>
      </>}
      {!property && <label>{t('name')}<input autoComplete="name" name="name" required maxLength={120} /></label>}
      {!property && <label>{t('email')}<input autoComplete="email" name="email" type="email" required maxLength={254} /></label>}
      <label>{t('phone')}<input autoComplete="tel" name="phone" type="tel" required maxLength={40} /></label>
      {!property && <label>{t('subject')}<input name="subject" required maxLength={160} /></label>}
      <label className="form-wide">{t('message')}<textarea name="message" rows={5} required minLength={10} maxLength={property ? 2500 : 3000} /></label>
    </div>
    <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <button className="button button-primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? t('sending') : property ? p('reserve') : t('send')}</button>
    {status === 'success' && <p className="form-feedback form-success" role="status">{t('success')}</p>}
    {status === 'error' && <p className="form-feedback form-error" role="alert">{error}</p>}
  </form>;
}
