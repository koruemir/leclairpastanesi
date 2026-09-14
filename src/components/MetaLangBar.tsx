import Link from 'next/link';
import type { Locale } from '@/i18n';
import { locales } from '@/i18n';

type MetaLangBarProps = {
  locale: Locale;
};

const langNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  ar: 'العربية',
  ru: 'Русский',
};

export function MenuTopNav({ locale }: MetaLangBarProps) {
  return (
    <header className="mx-auto mt-5 w-[96%] max-w-6xl">
      <nav className="flex flex-wrap items-center justify-between gap-2">
        <p className="rounded-full bg-[#2f6c52] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white">
          Leclair
        </p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {locales.map((code) => (
            <Link
              key={code}
              href={`/${code}`}
              aria-current={code === locale ? 'page' : undefined}
              className={`rounded-full px-2.5 py-1.5 text-sm font-semibold ${
                code === locale ? 'bg-[#2f6c52] text-white' : 'bg-white/75 text-[#4c3d32]'
              }`}
            >
              {langNames[code]}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
