import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(6).max(40),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(0).optional(),
});

type ContactEmail = {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  recipient: 'visitor' | 'admin';
};

async function sendContactEmail(email: ContactEmail): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${email.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: email.from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
      cache: 'no-store',
    });
    if (!response.ok) {
      console.error(`Resend failed to deliver the ${email.recipient} contact email: ${response.status}`);
    }
    return response.ok;
  } catch (error) {
    console.error(`Unable to send the ${email.recipient} contact email.`, error);
    return false;
  }
}

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json().catch(() => null));
  if (!result.success) {
    return NextResponse.json({ error: 'Please check the form fields and try again.' }, { status: 400 });
  }
  if (result.data.website) return NextResponse.json({ ok: true });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const adminEmail = process.env.CONTACT_ADMIN_EMAIL || 'info@congobuilders.com';
  if (!apiKey || !from) {
    console.error('Contact email delivery requires RESEND_API_KEY and CONTACT_FROM_EMAIL.');
    return NextResponse.json({ error: 'The contact service is not configured. Please call or email us directly.' }, { status: 503 });
  }

  const { name, email, phone, subject, message } = result.data;
  const details = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Subject: ${subject}`,
    '',
    message,
  ].join('\n');

  const [adminSent, visitorSent] = await Promise.all([
    sendContactEmail({
      apiKey,
      from,
      to: adminEmail,
      subject: `Website contact: ${subject}`,
      text: details,
      replyTo: email,
      recipient: 'admin',
    }),
    sendContactEmail({
      apiKey,
      from,
      to: email,
      subject: 'We received your message - Congo Builders',
      text: `Hello ${name},\n\nThank you for contacting Congo Builders. We have received your message and will get back to you.\n\nYour message:\n${details}`,
      recipient: 'visitor',
    }),
  ]);

  if (!adminSent || !visitorSent) {
    return NextResponse.json({ error: 'We could not send your message. Please call or email us directly.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
