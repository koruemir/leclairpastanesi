"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, Home, MapPin, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { money } from "@/lib/cart";

const items = [
  { href: "/", name: "Ana Sayfa", icon: Home },
  { href: "/menu", name: "Menü", icon: BookOpen },
  { href: "/iletisim", name: "İletişim", icon: MapPin },
];

export function DesktopNavigation() {
  const pathname = usePathname();
  return (
    <nav className="desktop-nav" aria-label="Ana gezinme">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              ? "active"
              : ""
          }
          aria-current={
            pathname === item.href
              ? "page"
              : item.href !== "/" && pathname.startsWith(item.href)
                ? "true"
                : undefined
          }
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}

export function HeaderCart() {
  const { count } = useCart();
  return (
    <Link href="/sepet" className="header-cart" aria-label={`Sepetim, ${count} ürün`}>
      <ShoppingBag size={21} aria-hidden="true" />
      <span className="header-cart-label">Sepetim</span>
      <span className="cart-count">{count}</span>
    </Link>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const { count, total } = useCart();
  return (
    <>
      {count > 0 && pathname !== "/sepet" && (
        <Link href="/sepet" className="floating-cart">
          <span>
            <ShoppingBag size={19} aria-hidden="true" />
            {count} ürün <span className="floating-divider">·</span> {money(total)}
          </span>
          <span>
            Sepeti Gör <ArrowUpRight size={18} aria-hidden="true" />
          </span>
        </Link>
      )}
      <nav className="mobile-nav" aria-label="Mobil gezinme">
        {[...items, { href: "/sepet", name: "Sepet", icon: ShoppingBag }].map((item) => {
          const active =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
            >
              <span className="mobile-icon">
                <item.icon size={21} aria-hidden="true" />
                {item.href === "/sepet" && count > 0 && (
                  <span className="mobile-count">{count}</span>
                )}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
