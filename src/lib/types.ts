export type CategorySlug = "pastalar" | "tatlilar" | "baklavalar" | "kurabiyeler";

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: "cake" | "dessert" | "baklava" | "cookie";
}

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
}

export interface Product {
  sortOrder: number;
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  category: CategorySlug;
  image: string;
  imageAlt: string;
  variants: ProductVariant[];
  badge?: string;
  featured?: boolean;
  visible: boolean;
  isDemo: boolean;
}

export interface CartLine {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface ResolvedCartLine extends CartLine {
  product: Product;
  variant: ProductVariant;
  subtotal: number;
}

export interface BusinessConfig {
  name: string;
  location: string;
  city: string;
  district: string;
  neighborhood: string;
  address: string;
  postalCode: string;
  phone: string;
  whatsappPhone: string;
  hours: string[];
  mapsUrl: string;
  siteUrl: string;
  verified: boolean;
  liveRequested: boolean;
}

export interface CheckoutDetails {
  name: string;
  fulfillment: "delivery" | "pickup";
  neighborhood: string;
  address: string;
  note: string;
}
