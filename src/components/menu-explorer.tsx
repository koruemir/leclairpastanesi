"use client";

import { useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SearchX, X } from "lucide-react";
import {
  selectProductIndices,
  parseProductSort,
  type ProductSearchItem,
} from "@/lib/product-search";

const subscribeToHydration = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;

export function MenuExplorer({
  title,
  items,
  children,
}: {
  title: string;
  items: ProductSearchItem[];
  children: ReactNode[];
}) {
  const searchId = useId();
  const sortId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const hydrated = useSyncExternalStore(subscribeToHydration, clientHydrated, serverHydrated);
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const sort = parseProductSort(searchParams.get("sort"));
  const indices = selectProductIndices(items, query, sort);
  const hasQuery = query.trim().length > 0;

  function updateUrl(key: "q" | "sort", value: string, history: "replace" | "push" = "replace") {
    const url = new URL(window.location.href);
    if (!value || (key === "sort" && value === "recommended")) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
    const href = `${url.pathname}${url.search}${url.hash}`;
    if (href !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      // Next's native history integration keeps the URL, results and back/forward in sync.
      window.history[history === "push" ? "pushState" : "replaceState"](null, "", href);
    }
  }

  function clearSearch() {
    updateUrl("q", "", "push");
    searchRef.current?.focus();
  }

  return (
    <>
      <div className="menu-tools">
        <div className="menu-search" role="search" aria-label="Menüde ara">
          <Search size={20} strokeWidth={1.7} aria-hidden="true" />
          <label className="visually-hidden" htmlFor={searchId}>Tatlı ara</label>
          <input
            id={searchId}
            ref={searchRef}
            type="search"
            autoComplete="off"
            disabled={!hydrated}
            placeholder="Canınız ne çekiyor?"
            value={query}
            onChange={(event) => updateUrl("q", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") clearSearch();
            }}
          />
          {query && (
            <button type="button" onClick={clearSearch} disabled={!hydrated} aria-label="Aramayı temizle">
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="menu-sort">
          <label htmlFor={sortId}>Sıralama</label>
          <select
            id={sortId}
            disabled={!hydrated}
            value={sort}
            onChange={(event) => updateUrl("sort", event.target.value, "push")}
          >
            <option value="recommended">Vitrin sırası</option>
            <option value="price-asc">Fiyat: düşükten yükseğe</option>
            <option value="price-desc">Fiyat: yüksekten düşüğe</option>
          </select>
        </div>
      </div>
      <div className="catalog-count">
        <strong>{hasQuery ? "Size göre lezzetler" : title}</strong>
        <span role="status" aria-live="polite" aria-atomic="true">
          {hasQuery ? `${items.length} lezzetten ${indices.length} sonuç` : `${indices.length} tatlı seçenek`}
        </span>
      </div>
      {sort !== "recommended" && (
        <p className="menu-price-note">Kartta görünen fiyatlara göre sıralanır. Satış birimleri ürüne göre değişir.</p>
      )}
      {indices.length ? (
        <div className="product-grid">
          {indices.map((index) => children[index])}
        </div>
      ) : (
        <div className="menu-empty">
          <SearchX size={32} strokeWidth={1.3} aria-hidden="true" />
          <h2>{hasQuery ? "Bu lezzeti henüz bulamadık." : "Vitrinimiz hazırlanıyor."}</h2>
          <p>
            {hasQuery
              ? "Daha kısa bir arama deneyin; örneğin çikolata, fıstık veya ekler."
              : "Yeni lezzetler için yakında yeniden bekleriz."}
          </p>
          {hasQuery && (
            <button className="button button-green menu-reset" type="button" onClick={clearSearch} disabled={!hydrated}>
              Aramayı temizle
            </button>
          )}
        </div>
      )}
    </>
  );
}
