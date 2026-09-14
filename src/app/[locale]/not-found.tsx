import Link from 'next/link';

export default function LocaleNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-6">
      <div className="rounded-[1.5rem] border border-[#e2d4c2] bg-white/90 p-6 text-center">
        <p className="text-2xl font-semibold text-[#442d23]">404</p>
        <p className="mt-2 text-sm text-[#6d5a4d]">Aradığınız sayfa bulunamadı.</p>
        <Link href="/tr" className="mt-5 inline-flex rounded-full bg-[#6f4e37] px-4 py-2 text-sm text-white">
          Ana sayfaya dön
        </Link>
      </div>
    </main>
  );
}
