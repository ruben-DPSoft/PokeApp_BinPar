'use client';

import { useEffect, useState } from 'react';
import { useLocaleStore } from '@/store/locale';
import { useT } from '@/lib/i18n/useT';
import { cn } from '@/lib/utils';

/**
 * Toggle de idioma. Diseño "interruptor" de 2 estados (ES / EN) en lugar de
 * un dropdown porque sólo hay dos idiomas — un toggle es más rápido visual y
 * cognitivamente.
 */
export function LanguageToggle() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const t = useT();

  // Anti-flash: hasta hidratar, evitamos pintar el indicador "activo" para
  // no mostrar el idioma incorrecto al usuario que tenía guardado el otro.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <div
      role="group"
      aria-label={t('header.language')}
      className="inline-flex p-0.5 rounded-lg bg-overlay/[0.04] border border-overlay/10 text-[11px] font-bold"
    >
      <button
        type="button"
        onClick={() => setLocale('es')}
        aria-pressed={hydrated && locale === 'es'}
        className={cn(
          'px-2 py-1 rounded-md transition',
          hydrated && locale === 'es'
            ? 'bg-ink-50 text-ink-900'
            : 'text-ink-200 hover:text-ink-50',
        )}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={hydrated && locale === 'en'}
        className={cn(
          'px-2 py-1 rounded-md transition',
          hydrated && locale === 'en'
            ? 'bg-ink-50 text-ink-900'
            : 'text-ink-200 hover:text-ink-50',
        )}
      >
        EN
      </button>
    </div>
  );
}
