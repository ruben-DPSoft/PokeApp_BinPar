'use client';

import { useT } from '@/lib/i18n/useT';

export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-overlay/5 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-xs text-ink-300 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>
          {t('footer.built_with')}{' '}
          <a
            href="https://pokeapi.co/"
            target="_blank"
            rel="noreferrer"
            className="text-flame-300 hover:text-flame-200 underline-offset-4 hover:underline"
          >
            PokéAPI
          </a>
          <span className="text-ink-400"> · </span>
          {t('footer.author')}{' '}
          <span className="text-ink-100 font-semibold">Rubén R. Ganga</span>
        </p>
        <p className="text-ink-400">
          {t('footer.binpar')}
          <span> · </span>
          {t('footer.disclaimer')}
        </p>
      </div>
    </footer>
  );
}
