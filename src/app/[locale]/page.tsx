import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { MenuPageClient } from '@/components/MenuPageClient';
import { menuData, siteConfig } from '@/lib/menu-data';
import { isLocale, locales, type Locale } from '@/i18n';

type PageProps = {
  params: { locale: string };
  searchParams?: { category?: string };
};

function normalizeLocaleText(value: string | undefined, fallback = 'tr') {
  if (value === 'ar' || value === 'ru' || value === 'en' || value === 'tr') {
    return value;
  }

  return fallback;
}

function seoTextForCategory(locale: Locale, categoryId: string) {
  if (categoryId === 'all') {
    return {
      title: siteConfig.meta[locale].title,
      description: siteConfig.meta[locale].description,
      keywords: siteConfig.defaultSeo.keywords,
      heading: siteConfig.meta[locale].title,
      categoryName: null as string | null,
    };
  }

  const category = menuData.categories.find((item) => item.id === categoryId);
  if (!category) {
    return {
      title: siteConfig.meta[locale].title,
      description: siteConfig.meta[locale].description,
      keywords: siteConfig.defaultSeo.keywords,
      heading: categoryId,
      categoryName: null as string | null,
    };
  }

  const block = category.seo ?? {
    title: category.name[locale] ?? category.name.tr ?? '',
    description: siteConfig.meta[locale].description,
    keywords: siteConfig.defaultSeo.keywords,
  };

  return {
    title: block.title,
    description: block.description,
    keywords: block.keywords,
    heading: category.name[locale] ?? category.name.tr ?? '',
    categoryName: category.name[locale] ?? category.name.tr ?? category.id,
  };
}

function createItemListLdJson(locale: Locale, categoryId: string) {
  const categoryProducts = categoryId === 'all'
    ? menuData.products
    : menuData.products.filter((product) => product.categoryId === categoryId);

  const itemList = categoryProducts.map((product, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: product.name[locale] ?? product.name.tr ?? '',
    description: product.description?.[locale] ?? product.description?.tr ?? '',
    url: `${siteConfig.siteUrl}/${locale}?category=${categoryProducts[0]?.categoryId ?? 'all'}#${product.slug}`,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: categoryId === 'all'
      ? 'Büyükçekmece Güzelce Ürün Listesi'
      : `Büyükçekmece Güzelce - ${categoryProducts[0]?.categoryId ?? ''} Kategorisi`,
    numberOfItems: itemList.length,
    itemListElement: itemList,
  };
}

function createRestaurantLdJson() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: siteConfig.brandName,
    url: siteConfig.siteUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Büyükçekmece',
      addressLocality: 'Büyükçekmece',
      addressRegion: 'İstanbul',
      postalCode: '34303',
      addressCountry: 'TR',
    },
    servesCuisine: 'Dessert',
    sameAs: [siteConfig.siteUrl],
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) {
    return {
      title: 'Büyükçekmece Güzelce',
      description: 'Büyükçekmece Güzelce menüsü',
    };
  }

  const locale = params.locale as Locale;
  const categoryId = normalizeLocaleText(searchParams?.category, 'all');
  const seoText = seoTextForCategory(locale, categoryId);
  const canonical = `${siteConfig.siteUrl}/${locale}${categoryId === 'all' ? '' : `?category=${categoryId}`}`;
  const alternates = locales.reduce<Record<Locale, string>>((acc, code) => {
    const path = categoryId === 'all' ? '' : `?category=${categoryId}`;
    acc[code] = `${siteConfig.siteUrl}/${code}${path}`;
    return acc;
  }, {} as Record<Locale, string>);

  return {
    title: seoText.title,
    description: seoText.description,
    keywords: seoText.keywords,
    alternates: {
      canonical,
      languages: alternates,
    },
    openGraph: {
      title: seoText.title,
      description: seoText.description,
      locale: locale === 'tr' ? 'tr_TR' : locale === 'en' ? 'en_US' : locale === 'ar' ? 'ar_AR' : 'ru_RU',
      type: 'website',
      siteName: siteConfig.brandName,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoText.title,
      description: seoText.description,
      creator: '@',
    },
  };
}

export default async function LocaleMenuPage({ params, searchParams }: PageProps) {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const search = normalizeLocaleText(searchParams?.category, 'all');
  const header = await getTranslations({ locale, namespace: 'header' });
  const seoText = seoTextForCategory(locale, search);
  const itemListLdJson = createItemListLdJson(locale, search);
  const restaurantLdJson = createRestaurantLdJson();
  const visibleCategoryHeading = seoText.categoryName
    ? `${seoText.heading}`
    : header('title');

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.12em] text-[#7b6756]">{header('overline')}</p>
        <h1 className="text-4xl font-serif text-[#311f17]">{visibleCategoryHeading}</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[#645548] sm:text-base">
          {seoText.description}
        </p>
      </header>

      <script
        suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([restaurantLdJson, itemListLdJson]) }}
      />

      <MenuPageClient
        locale={locale}
        categories={menuData.categories}
        products={menuData.products}
        initialCategory={search}
      />
    </div>
  );
}
