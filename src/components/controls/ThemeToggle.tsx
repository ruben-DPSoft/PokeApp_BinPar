'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/theme';
import { useT } from '@/lib/i18n/useT';
import { cn } from '@/lib/utils';

/**
 * Botón de tema. Muestra un sol o luna según el estado actual.
 *
 * Detalle de hidratación: como el tema definitivo vive en localStorage y se
 * fija en <html data-theme> antes de la hidratación de React, durante el
 * primer render el componente no conoce el tema con seguridad. Para evitar
 * un "flash" del icono incorrecto, esperamos a `useEffect` para activar la
 * lectura del store; mientras tanto pintamos un placeholder neutro.
 */
export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  const t = useT();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const isDark = theme === 'dark';
  const label = hydrated
    ? isDark
      ? t('header.theme_switch_to_light')
      : t('header.theme_switch_to_dark')
    : t('header.theme');

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center w-9 h-9 rounded-lg transition',
        'border border-overlay/10 text-ink-100 hover:bg-overlay/5 hover:text-ink-50',
      )}
    >
      {hydrated && isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
