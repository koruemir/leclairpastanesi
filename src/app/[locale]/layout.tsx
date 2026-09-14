import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { MenuTopNav } from '@/components/MetaLangBar';
import { isLocale, type Locale } from '@/i18n';

type Props = {
  children: ReactNode;
  params: { locale: string };
};

async function getMessages(locale: Locale) {
  if (locale === 'tr') return (await import('@/messages/tr.json')).default;
  if (locale === 'en') return (await import('@/messages/en.json')).default;
  if (locale === 'ar') return (await import('@/messages/ar.json')).default;
  return (await import('@/messages/ru.json')).default;
}

export default async function LocaleLayout({ children, params }: Props) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as Locale;
  setRequestLocale(locale);
  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <MenuTopNav locale={locale} />
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
