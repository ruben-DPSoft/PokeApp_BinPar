'use client';

import { useFiltersStore, type ViewMode } from '@/store/filters';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';

interface Item {
  mode: ViewMode;
  label: string;
  icon: React.ReactNode;
}

/**
 * Conmutador entre los tres modos de vista (cards, table, pokedex).
 *
 * El modo "pokedex" tiene un tratamiento visual ligeramente diferente para
 * señalar que es una experiencia más rica: barra con LED y color de marca.
 */
export function ViewModeToggle() {
  const viewMode = useFiltersStore((s) => s.viewMode);
  const setViewMode = useFiltersStore((s) => s.setViewMode);
  const t = useT();

  const items: Item[] = [
    {
      mode: 'cards',
      label: t('viewmode.cards'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      mode: 'table',
      label: t('viewmode.table'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      ),
    },
    {
      mode: 'pokedex',
      label: t('viewmode.pokedex'),
      // Pokéball oficial (en assets) en lugar del glifo de tres círculos.
      // Conserva sus colores propios — no hereda currentColor — y se ve igual
      // en estados activo/inactivo, así que no necesita el LED de antes.
      icon: (
        <img
          src="/assets/Pok%C3%A9_Ball_icon.svg"
          alt=""
          aria-hidden
          width={18}
          height={18}
          className="w-[18px] h-[18px] shrink-0"
        />
      ),
    },
  ];

  return (
    <div
      role="tablist"
      aria-label={t('viewmode.aria')}
      className="inline-flex p-1 rounded-2xl bg-ink-700/60 border border-overlay/10 shadow-inset-deep"
    >
      {items.map((it) => {
        const active = viewMode === it.mode;
        const isPokedex = it.mode === 'pokedex';
        return (
          <button
            key={it.mode}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setViewMode(it.mode)}
            className={cn(
              'relative inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition',
              active
                ? isPokedex
                  ? 'bg-flame-500 text-white shadow-pokedex'
                  : 'bg-ink-50 text-ink-900'
                : 'text-ink-200 hover:text-ink-50 hover:bg-overlay/5',
            )}
          >
            {it.icon}
            <span className="hidden sm:inline">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
