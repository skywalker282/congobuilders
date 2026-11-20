'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { deleteMyInquiry, updateMyInquiry } from './actions';
import type { UserInquiry } from '@/lib/strapi-auth';

export function InquiryList({ inquiries }: { inquiries: UserInquiry[] }) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [editingId, setEditingId] = useState<string>();
  const [draftMessage, setDraftMessage] = useState('');
  const [draftPrice, setDraftPrice] = useState('');
  const [draftCurrency, setDraftCurrency] = useState<'USD' | 'CDF'>('USD');
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState<{ id: string; message: string }>();

  async function save(inquiry: UserInquiry) {
    setBusyId(inquiry.id);
    setError(undefined);
    try {
      const price = Number(draftPrice);
      if (!draftPrice.trim() || !Number.isSafeInteger(price) || price < 0) {
        setError({ id: inquiry.id, message: t('bookingPrice') });
        return;
      }
      const result = await updateMyInquiry(inquiry.id, draftMessage, price, draftCurrency);
      if (!result.ok) {
        setError({ id: inquiry.id, message: result.error });
        return;
      }
      setEditingId(undefined);
      router.refresh();
    } catch (submissionError) {
      console.error('Unable to update the inquiry.', submissionError);
      setError({ id: inquiry.id, message: t('inquiryActionFailure') });
    } finally {
      setBusyId(undefined);
    }
  }

  async function remove(inquiry: UserInquiry) {
    if (!window.confirm(t('confirmDeleteInquiry'))) return;
    setBusyId(inquiry.id);
    setError(undefined);
    try {
      const result = await deleteMyInquiry(inquiry.id);
      if (!result.ok) {
        setError({ id: inquiry.id, message: result.error });
        return;
      }
      router.refresh();
    } catch (submissionError) {
      console.error('Unable to delete the inquiry.', submissionError);
      setError({ id: inquiry.id, message: t('inquiryActionFailure') });
    } finally {
      setBusyId(undefined);
    }
  }

  return (
    <div className="inquiry-list">
      {inquiries.map((inquiry) => {
        const isEditing = editingId === inquiry.id;
        const isBusy = busyId === inquiry.id;
        return (
          <article className="inquiry-card" key={inquiry.id}>
            <div className="inquiry-card-header">
              <div><span className="eyebrow">{inquiry.date || t('inquiry')}</span><h2>{inquiry.property || t('propertyUnavailable')}</h2></div>
              <span className={`inquiry-progress-badge inquiry-progress-${inquiry.progress}`}>
                {t('progress')}: {inquiry.progress === 'confirmed' ? t('progressConfirmed') : inquiry.progress === 'declined' ? t('progressDeclined') : t('progressPending')}
              </span>
            </div>
            {isEditing ? (
              <div className="form-grid">
                <label>
                  {t('bookingPrice')}
                  <input
                    type="number"
                    min="0"
                    max={Number.MAX_SAFE_INTEGER}
                    step="1"
                    required
                    value={draftPrice}
                    onChange={(event) => setDraftPrice(event.target.value)}
                  />
                </label>
                <label>
                  {t('bookingCurrency')}
                  <select value={draftCurrency} onChange={(event) => setDraftCurrency(event.target.value as 'USD' | 'CDF')} required>
                    <option value="USD">USD</option>
                    <option value="CDF">CDF</option>
                  </select>
                </label>
                <label className="form-wide inquiry-editor">
                  {t('inquiryMessage')}
                  <textarea value={draftMessage} onChange={(event) => setDraftMessage(event.target.value)} rows={5} minLength={10} maxLength={3000} />
                </label>
              </div>
            ) : (
              <>
                {inquiry.price !== null && inquiry.currency && (
                  <p className="inquiry-message"><strong>{t('bookingPrice')}:</strong> {inquiry.price.toLocaleString()} {inquiry.currency}</p>
                )}
                <p className="inquiry-message">{inquiry.message}</p>
              </>
            )}
            {inquiry.progress === 'pending' && (
              <div className="inquiry-actions">
                {isEditing ? (
                  <>
                    <button className="button button-primary" type="button" disabled={isBusy} onClick={() => void save(inquiry)}>
                      {isBusy ? t('submitting') : t('saveInquiry')}
                    </button>
                    <button className="button button-outline" type="button" disabled={isBusy} onClick={() => { setEditingId(undefined); setError(undefined); }}>
                      {t('cancel')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="button button-outline"
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        setEditingId(inquiry.id);
                        setDraftMessage(inquiry.message);
                        setDraftPrice(inquiry.price?.toString() ?? '');
                        setDraftCurrency(inquiry.currency ?? 'USD');
                        setError(undefined);
                      }}
                    >
                      {t('editInquiry')}
                    </button>
                    <button className="button button-danger" type="button" disabled={isBusy} onClick={() => void remove(inquiry)}>
                      {isBusy ? t('submitting') : t('deleteInquiry')}
                    </button>
                  </>
                )}
              </div>
            )}
            {error?.id === inquiry.id && <p className="form-feedback form-error" role="alert">{error.message}</p>}
          </article>
        );
      })}
    </div>
  );
}
