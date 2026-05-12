'use client';

import { useEffect } from 'react';
import { useT } from '@/lib/i18n/useT';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary global. Se monta automáticamente si algún Server Component
 * lanza, o si un Client Component superior no atrapa el error.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useT();
  useEffect(() => {
    // En una app real, enviar a Sentry/Datadog aquí.
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="display text-6xl font-black text-flame-400">Oops</p>
      <h1 className="display mt-2 text-2xl font-bold text-ink-50">{t('error.title')}</h1>
      <p className="mt-2 text-ink-300">{error.message}</p>
      <button onClick={reset} className="btn-primary mt-6">
        {t('error.retry')}
      </button>
    </div>
  );
}
