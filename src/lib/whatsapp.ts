import { siteConfig } from '@/lib/menu-data';
import type { Locale } from '@/i18n';

export function buildWhatsappMessage(locale: Locale, productName?: string) {
  if (!siteConfig.whatsapp.phoneNumber.trim()) {
    return '';
  }

  const productText = productName?.trim() ? ` ${productName}` : '';
  const template = siteConfig.whatsapp.templates[locale] ?? siteConfig.whatsapp.templates.en;
  const text = template.replace('{product}', productText);
  return `https://wa.me/${siteConfig.whatsapp.phoneNumber}?text=${encodeURIComponent(text)}`;
}
