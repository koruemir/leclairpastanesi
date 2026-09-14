export const locales = ['tr', 'en', 'ar', 'ru'] as const;

export const defaultLocale = 'tr';

export type Locale = (typeof locales)[number];

export type AppLocaleParams = {
  locale: Locale;
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
