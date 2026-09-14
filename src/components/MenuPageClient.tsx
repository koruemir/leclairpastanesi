import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Sparkles, ImageOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import { buildWhatsappMessage } from '@/lib/whatsapp';
import type { Category, Product } from '@/lib/menu-data';
import { getLocalizedText } from '@/lib/menu-data';

type MenuState = {
  locale: Locale;
  categories: Category[];
  products: Product[];
  initialCategory: string;
};

const missingImageLabel: Record<Locale, string> = {
  tr: 'Görsel bulunamadı',
  en: 'Image not available',
  ar: 'الصورة غير متاحة',
  ru: 'Изображение недоступно',
};

const langNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  ar: 'العربية',
  ru: 'Русский',
};

function formatPrice(price: number | null | undefined, locale: Locale) {
  if (price == null) {
    return null;
  }

  return new Intl.NumberFormat(
    locale === 'ar'
      ? 'ar-EG'
      : locale === 'ru'
        ? 'ru-RU'
        : locale === 'en'
          ? 'en-US'
          : 'tr-TR',
    {
      style: 'currency',
      currency: 'TRY',
    },
  ).format(price);
}

function LanguageRail({ current }: { current: Locale }) {
  const pathWithoutLocale = '';

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <a
            key={locale}
            href={`/${locale}${pathWithoutLocale}`}
            className={`inline-flex shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              active
                ? 'bg-[#6f4e37] text-white shadow-sm'
                : 'bg-white/80 text-[#4a3c2f] hover:bg-white'
            }`}
          >
            {langNames[locale]}
          </a>
        );
      })}
    </div>
  );
}

export function MenuPageClient({ locale, categories, products, initialCategory }: MenuState) {
  const t = useTranslations('menu');
  const labels = useTranslations();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const visibleCategories = useMemo(
    () => categories.filter((category) => !category.isHidden && category.isActive !== false),
    [categories],
  );

  const activeCategory = selectedCategory === 'all'
    ? null
    : categories.find((category) => category.id === selectedCategory) || null;

  const filteredProducts = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') {
      return products;
    }

    return products.filter((product) => product.categoryId === selectedCategory);
  }, [products, selectedCategory]);

  const sectionTitle = activeCategory ? getLocalizedText(activeCategory.name, locale) : t('header');
  const count = filteredProducts.length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#efe2d0] bg-gradient-to-br from-[#f9f2e6] via-[#fff9ef] to-[#e8dfd0] p-5">
        <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#5b493d] shadow-sm">
          <Sparkles className="h-4 w-4" /> {labels('hero.badge')}
        </span>
        <div className="pt-8">
          <h1 className="text-3xl font-serif tracking-tight text-[#2b211d] sm:text-4xl">
            {labels('header.title')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5c5148] sm:text-base">
            {labels('header.subtitle')}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#7d6b58]">{labels('header.overline')}</p>
          <div className="sr-only">{labels('menu.empty')}</div>
        </div>
        <div className="mt-6">
          <LanguageRail current={locale} />
        </div>
      </div>

      <section aria-label={labels('menu.header')} className="space-y-3">
        <div className="rounded-full bg-white/60 px-3 py-2 text-sm font-semibold tracking-wide text-[#5f4c3d] shadow-sm">
          {sectionTitle}
        </div>
        <div className="no-scrollbar flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-[#6f4e37] text-white'
                : 'border border-[#d8cbba] text-[#5a4a3a] hover:bg-white'
            }`}
          >
            {t('all')}
          </button>
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === category.id
                  ? 'bg-[#6f4e37] text-white'
                  : 'border border-[#d8cbba] text-[#5a4a3a] hover:bg-white'
              }`}
            >
              {getLocalizedText(category.name, locale)}
            </button>
          ))}
        </div>
      </section>

      {count === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-[#e4d8c9] bg-white/80 p-6 text-center">
          <p className="text-lg font-semibold text-[#4b3d31]">{labels('states.emptyTitle')}</p>
          <p className="mt-2 text-sm text-[#746552]">{t('empty')}</p>
        </div>
      ) : (
        <section
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          aria-label={t('header')}
        >
          {filteredProducts.map((product) => {
            const whatsapp = buildWhatsappMessage(locale, getLocalizedText(product.name, locale));
            const title = getLocalizedText(product.name, locale);
            const description = product.description ? getLocalizedText(product.description, locale) : null;
            const price = formatPrice(product.priceTRY, locale);

            return (
              <article
                key={product.id}
                className="group relative overflow-hidden rounded-[1.5rem] border border-[#e8dbc9] bg-white/90 shadow-[0_12px_40px_-32px_rgba(43,33,29,0.45)] transition hover:-translate-y-1 hover:shadow-[0_14px_45px_-28px_rgba(43,33,29,0.5)]"
              >
                <div className="relative h-48 w-full bg-[#efe4d3]">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-[#907f70]">
                      <div className="flex flex-col items-center gap-2">
                        <ImageOff className="h-7 w-7" />
                        <p className="text-xs">{missingImageLabel[locale]}</p>
                      </div>
                    </div>
                  )}
                  {product.inStock === false ? (
                    <span className="absolute right-3 top-3 rounded-full bg-[#2f2a25]/80 px-2.5 py-1.5 text-xs font-semibold text-white">
                      {labels('states.soldOut')}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-4 p-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-serif font-semibold text-[#2a221e]">{title}</h2>
                    <p className="text-sm text-[#6d5c4f]">{description ?? labels('menu.noDescription')}</p>
                  </div>

                  {product.ingredients?.[locale] ? (
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#8d7d6e]">
                      {product.ingredients[locale]}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#f5ecde] px-3 py-2 text-sm font-semibold text-[#5a4a3c]">
                      <Heart className="h-4 w-4" />
                      {price ?? labels('states.priceUnknown')}
                    </span>

                    {whatsapp ? (
                      <a
                        href={whatsapp}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#6f4e37] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#5a402e]"
                      >
                        <MessageCircle className="h-4 w-4" /> {labels('actions.whatsapp.orderWithProduct')}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8cab9] px-3 py-2 text-xs text-[#8c7d6d]">
                        <MessageCircle className="h-4 w-4" /> {labels('actions.whatsapp.missingNumber')}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
