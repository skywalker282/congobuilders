import { redirect } from 'next/navigation';

export default async function RentPropertiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/properties?transaction=RENT`);
}
