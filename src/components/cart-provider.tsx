"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { AlertCircle, Check } from "lucide-react";
import {
  CART_STORAGE_KEY,
  cartTotal,
  MAX_QUANTITY,
  sanitizeCart,
  sanitizeStoredCart,
} from "@/lib/cart";
import type { CartLine, Product } from "@/lib/types";

interface CartContextValue {
  lines: CartLine[];
  products: Product[];
  refresh: () => Promise<Product[]>;
  ready: boolean;
  count: number;
  total: number;
  add: (line: CartLine, productName: string) => Promise<{ ok: boolean; error?: string }>;
  update: (productId: string, variantId: string, quantity: number) => void;
  remove: (productId: string, variantId: string) => void;
}
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  initialProducts,
}: {
  children: React.ReactNode;
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const productsRef = useRef(initialProducts);
  const [lines, setLines] = useState<CartLine[]>([]);
  const linesRef = useRef<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const commitLines = useCallback((next: CartLine[]) => {
    linesRef.current = next;
    setLines(next);
  }, []);
  const inflight = useRef<Promise<Product[]> | null>(null);
  const pathname = usePathname();
  const refresh = useCallback((): Promise<Product[]> => {
    if (inflight.current) return inflight.current;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    const request = fetch("/api/catalog", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Fiyatlar güncellenemedi. Lütfen tekrar deneyin.");
        const data = (await response.json()) as { products: Product[] };
        if (!Array.isArray(data.products)) throw new Error("Katalog okunamadı.");
        productsRef.current = data.products;
        setProducts(data.products);
        commitLines(sanitizeCart(linesRef.current, data.products));
        return data.products;
      })
      .finally(() => {
        window.clearTimeout(timeout);
        inflight.current = null;
      });
    inflight.current = request;
    return request;
  }, [commitLines]);
  useEffect(() => {
    const update = () => {
      void refresh().catch(() => {});
    };
    update();
    window.addEventListener("focus", update);
    return () => window.removeEventListener("focus", update);
  }, [pathname, refresh]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) commitLines(sanitizeStoredCart(JSON.parse(saved)));
    } catch {
      /* A blocked or malformed store must not prevent shopping. */
    }
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY && event.key !== null) return;
      try {
        commitLines(sanitizeStoredCart(event.newValue ? JSON.parse(event.newValue) : []));
        // Do not discard products added in a tab that has a newer catalog.
        void refresh().catch(() => {});
      } catch {
        commitLines([]);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [commitLines, refresh]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* Keep the current tab usable if storage is unavailable. */
    }
  }, [lines, ready]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timeout);
  }, [notice]);

  const add = useCallback(
    async (line: CartLine, productName: string) => {
      try {
        let catalog = productsRef.current;
        if (!catalog.some((product) => product.id === line.productId &&
          product.variants.some((variant) => variant.id === line.variantId))) {
          catalog = await refresh();
        }
        if (!sanitizeCart([line], catalog).length) throw new Error("Bu ürün artık satışta değil.");
        const existing = linesRef.current.find((item) =>
          item.productId === line.productId && item.variantId === line.variantId)?.quantity ?? 0;
        if (existing + line.quantity > MAX_QUANTITY) {
          throw new Error("Aynı ürün ve seçenekten en fazla 99 adet ekleyebilirsiniz.");
        }
        commitLines(sanitizeStoredCart([...linesRef.current, line]));
        setNoticeError(false);
        setNotice(`${productName} sepetinize eklendi.`);
        return { ok: true };
      } catch (error) {
        const message =
          error instanceof Error && error.name !== "AbortError" && error.name !== "TypeError"
            ? error.message
            : "Katalog güncellenemedi. Bağlantınızı kontrol edip yeniden deneyin.";
        setNoticeError(true);
        setNotice(message);
        return { ok: false, error: message };
      }
    },
    [commitLines, refresh],
  );
  const update = useCallback((productId: string, variantId: string, quantity: number) => {
    if (!Number.isFinite(quantity)) return;
    commitLines(
      linesRef.current.map((line) =>
        line.productId === productId && line.variantId === variantId
          ? { ...line, quantity: Math.max(1, Math.min(MAX_QUANTITY, Math.floor(quantity))) }
          : line,
      ),
    );
  }, [commitLines]);
  const remove = useCallback((productId: string, variantId: string) => {
    commitLines(
      linesRef.current.filter((line) => !(line.productId === productId && line.variantId === variantId)),
    );
    setNoticeError(false);
    setNotice("Ürün sepetinizden çıkarıldı.");
  }, [commitLines]);
  const value = useMemo(
    () => ({
      lines,
      products,
      refresh,
      ready,
      count: sanitizeCart(lines, products).reduce((sum, line) => sum + line.quantity, 0),
      total: cartTotal(lines, products),
      add,
      update,
      remove,
    }),
    [lines, products, refresh, ready, add, update, remove],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`toast ${notice ? "toast-visible" : ""}`}
      >
        {notice && (
          <>
            {noticeError ? <AlertCircle size={18} /> : <Check size={18} />}
            <span>{notice}</span>
          </>
        )}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider");
  return cart;
}
