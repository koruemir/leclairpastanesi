import { defaultLocale } from '@/i18n';
import type { Locale } from '@/i18n';

export type LocalizedText = Partial<Record<Locale, string>>;

export type Category = {
  id: string;
  slug: string;
  name: LocalizedText;
  seo?: SeoBlock;
  sort: number;
  isHidden?: boolean;
  isActive?: boolean;
};

export type Product = {
  id: string;
  categoryId: string;
  slug: string;
  name: LocalizedText;
  description?: LocalizedText;
  ingredients?: LocalizedText;
  seo?: SeoBlock;
  imageUrl?: string;
  imageCredit?: string;
  priceTRY?: number;
  inStock?: boolean;
  isActive?: boolean;
  sort: number;
};

export type MenuPayload = {
  lastSyncedAt: string | null;
  brandSlug: string;
  categories: Category[];
  products: Product[];
  source: 'not-scraped' | 'scraped';
  sourceUrl: string | null;
};

export type SeoBlock = {
  title: string;
  description: string;
  keywords: string[];
};

export const menuData: MenuPayload = {
  lastSyncedAt: null,
  brandSlug: 'buyukcekmeciguzelce',
  categories: [
    {
      id: 'waffle',
      slug: 'waffle-tatli',
      sort: 10,
      name: {
        tr: 'Waffle & Mini Tatlılar',
        en: 'Waffle & Mini Desserts',
      },
      seo: {
        title: 'Büyükçekmece Waffle ve Mini Tatlılar',
        description:
          'Büyükçekmece Güzelce Waffle Tadı, waffle topları, waffle dondurmalı ürünler ve mini tatlı seçenekleri.',
        keywords: [
          'Büyükçekmece waffle',
          'waffle tatlı',
          'Büyükçekmece Güzelce',
          'mini waffle',
          'çiçekli waffle',
        ],
      },
    },
    {
      id: 'ekler',
      slug: 'ekler-kremali-tatlilar',
      sort: 20,
      name: {
        tr: 'Ekler ve Kremalı Tatlılar',
        en: 'Éclair and Cream Desserts',
      },
      seo: {
        title: 'Ekler ve Kremalı Tatlılar',
        description:
          'Taze pasta kremasıyla hazırlanan ekler ve lezzetli kremalı ürünler, Büyükçekmece bölgesine yakın menülerde.',
        keywords: [
          'Büyükçekmece ekler',
          'kremalı tatlı',
          'Büyükçekmece pastane ürünleri',
        ],
      },
    },
  ],
  products: [
    {
      id: 'prd-waffle-cikolata',
      slug: 'waffle-cikolata',
      categoryId: 'waffle',
      sort: 1,
      name: {
        tr: 'Çikolatalı Waffle Topu',
        en: 'Chocolate Waffle Ball',
      },
      description: {
        tr: 'Kıtır waffle, yüksek kakao kreması ve meyve ile harmanlanan yoğun bir tatlı alternatifi.',
      },
      ingredients: {
        tr: 'Waffle, krema, çikolata, meyve',
      },
      seo: {
        title: 'Çikolatalı Waffle Topu Fiyatı | Büyükçekmece Güzelce',
        description:
          'Büyükçekmece içinde çikolatalı waffle topu ve çikolata ağırlıklı mini tatlıları için sipariş ve fiyat bilgisi.',
        keywords: [
          'Büyükçekmece çikolatalı waffle',
          'waffle topu fiyatı',
          'çikolatalı waffle tatlı',
        ],
      },
    },
    {
      id: 'prd-waffle-karamel',
      slug: 'waffle-karamel',
      categoryId: 'waffle',
      sort: 2,
      name: {
        tr: 'Karamelli Waffle Topu',
        en: 'Caramel Waffle Ball',
      },
      description: {
        tr: 'Karamel tadı yoğun, çıtır dış kabuğa sahip, paylaşım için ideal mini waffle.',
      },
      ingredients: {
        tr: 'Waffle, karamel sos, krema, fındık',
      },
      seo: {
        title: 'Karamelli Waffle Topu Siparişi | Büyükçekmece',
        description: 'Karamelli waffle topu ve karamel ağırlıklı mini tatlı menüsü, Büyükçekmece için güçlü bir seçenek.',
        keywords: ['Büyükçekmece karamel waffle', 'mini waffle karamel', 'waffle tatlı siparişi'],
      },
    },
    {
      id: 'prd-ekler-karamel',
      slug: 'kremali-ekler-karamel',
      categoryId: 'ekler',
      sort: 3,
      name: {
        tr: 'Karamelli Mini Ekler',
        en: 'Mini Caramel Éclairs',
      },
      description: {
        tr: 'Ağır kremasıyla dengeli tatlı keyfi için klasik ekler yorumuyla hazırlanmış mini porsiyon seçenekleri.',
      },
      ingredients: {
        tr: 'Krema, yumuşak hamur, çikolata kaplama',
      },
      seo: {
        title: 'Mini Ekler ve Karamelli Tatlılar | Büyükçekmece Güzelce',
        description: 'Mini ekler, karamel kremalı ekler ve şık sunumlu tatlı tabakları için güçlü kategorik SEO metinleri.',
        keywords: ['Büyükçekmece mini ekler', 'ekler tatlı fiyatları', 'karamel ekler'],
      },
    },
  ],
  source: 'not-scraped',
  sourceUrl: 'https://buyukcekmeciguzelce.com',
};

export const siteConfig = {
  brandName: 'Büyükçekmece Güzelce',
  siteUrl: 'https://buyukcekmeciguzelce.com',
  shortDescription: {
    tr: 'Büyükçekmece Güzelce Waffle, ekler ve mini tatlı menüsü',
    en: 'Büyükçekmece Güzelce waffle, éclairs and mini desserts menu',
    ar: 'قائمة الحلويات الصغيرة والوافل في بيضوكهتجي جيزلجه',
    ru: 'Меню мини-десертов, вафель и эклеров Большое Чекмедже',
  },
  whatsapp: {
    phoneNumber: '',
    templates: {
      tr: 'Merhaba! {product} için ürün ve fiyat bilgisi rica ediyorum.',
      en: 'Hello! I would like to ask price and details for {product}.',
      ar: 'مرحبًا، أود الاستفسار عن المنتج {product} وسعره.',
      ru: 'Здравствуйте! Хотел(а) бы узнать цену и детали товара {product}.',
    },
  },
  meta: {
    tr: {
      title: 'Büyükçekmece Güzelce - Dijital Menü',
      description: 'Büyükçekmece Güzelce waffle, ekler ve mini tatlı menüsü. Ürün görselleri ve WhatsApp ile hızlı iletişim.',
    },
    en: {
      title: 'Buyukcekmeciguzelce - Digital Menu',
      description: 'Büyükçekmece Güzelce menu: waffles, éclairs and mini desserts with WhatsApp order flow.',
    },
    ar: {
      title: 'قائمة بيضوكهتجي جيزلجه الرقمية',
      description: 'وافل وجا وكيلا، قائمة لِتُفضّل الحلويات المصغرة مع تواصل واتساب سريع.',
    },
    ru: {
      title: 'Цифровое меню Büyükçekmece Güzelce',
      description: 'Меню вафель, эклеров и мини-десертов Büyükçekmece Güzelce с быстрым контактом через WhatsApp.',
    },
  },
  defaultSeo: {
    keywords: [
      'Büyükçekmece',
      'waffle tatlı',
      'waffle topları',
      'mini tatlı',
      'Büyükçekmece Güzelce',
      'pastane',
      'tatlı menüsü',
    ],
  },
};

export function getLocalizedText(value: LocalizedText, locale: Locale): string {
  return value[locale] ?? value[defaultLocale] ?? '';
}
