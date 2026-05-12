'use client';

import { useT } from '@/lib/i18n/useT';

/** Pequeña intro de la home. Cliente para reaccionar al cambio de idioma. */
export function HomeHero() {
  const t = useT();
  return (
    <section className="mb-6 sm:mb-8">
      <p className="max-w-2xl text-sm sm:text-base text-ink-200">
        {t('home.hero.subtitle')}
      </p>
    </section>
  );
}
