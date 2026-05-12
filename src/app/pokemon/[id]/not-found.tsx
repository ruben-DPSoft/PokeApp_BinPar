'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n/useT';

export default function NotFound() {
  const t = useT();
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="display text-6xl font-black text-flame-400">404</p>
      <h1 className="display mt-2 text-2xl font-bold text-ink-50">{t('notfound.title')}</h1>
      <p className="mt-2 text-ink-300">{t('notfound.body')}</p>
      <Link href="/" className="btn-primary mt-6 inline-flex">
        {t('notfound.cta')}
      </Link>
    </div>
  );
}
