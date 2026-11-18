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
  const [busyId, setBusyId] = useState<string>();
  const [error, setError] = useState<{ id: string; message: string }>();

  async function save(inquiry: UserInquiry) {
    setBusyId(inquiry.id);
    setError(undefined);
    try {
      const result = await updateMyInquiry(inquiry.id, draftMessage);
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
              <span className={`inquiry-status-badge inquiry-status-${inquiry.status}`}>
                {t('status')}: {inquiry.status === 'confirmed' ? t('statusConfirmed') : inquiry.status === 'declined' ? t('statusDeclined') : t('statusPending')}
              </span>
            </div>
            {isEditing ? (
              <label className="inquiry-editor">
                {t('inquiryMessage')}
                <textarea value={draftMessage} onChange={(event) => setDraftMessage(event.target.value)} rows={5} minLength={10} maxLength={3000} />
              </label>
            ) : (
              <p className="inquiry-message">{inquiry.message}</p>
            )}
            {inquiry.status === 'pending' && (
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
                    <button className="button button-outline" type="button" disabled={isBusy} onClick={() => { setEditingId(inquiry.id); setDraftMessage(inquiry.message); setError(undefined); }}>
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
