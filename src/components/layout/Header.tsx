'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n/useT';
import { LanguageToggle } from '@/components/controls/LanguageToggle';
import { ThemeToggle } from '@/components/controls/ThemeToggle';
import { MAX_NATIONAL_DEX } from '@/lib/pokemon/generations';
import { cn } from '@/lib/utils';

export function Header() {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const isGame = pathname?.startsWith('/whos-that-pokemon') ?? false;
  const isCompare = pathname?.startsWith('/compare') ?? false;

  const goRandom = () => {
    const id = 1 + Math.floor(Math.random() * MAX_NATIONAL_DEX);
    router.push(`/pokemon/${id}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-overlay/5 bg-ink-900/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center group shrink-0">
          <img
            src="/assets/logo.png"
            alt="Pokédex"
            className="h-16 w-auto shrink-0 transition group-hover:scale-[1.03] drop-shadow-md"
          />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Pokémon aleatorio — small joy, navega a /pokemon/{rand}. */}
          <button
            type="button"
            onClick={goRandom}
            title={t('header.random_aria')}
            aria-label={t('header.random_aria')}
            className="inline-flex items-center justify-center shrink-0 group"
          >
            <img
              src="/assets/random.png"
              alt=""
              aria-hidden
              className="h-12 w-auto shrink-0 object-contain opacity-80 transition group-hover:opacity-100 group-hover:scale-[1.06]"
            />
          </button>

          <Link
            href="/compare"
            aria-current={isCompare ? 'page' : undefined}
            title={t('nav.compare')}
            className="flex items-center shrink-0 group"
          >
            <img
              src="/assets/vs.png"
              alt={t('nav.compare')}
              className={cn(
                'h-12 w-auto shrink-0 object-contain transition group-hover:scale-[1.06]',
                isCompare ? 'drop-shadow-[0_2px_6px_rgba(237,74,8,0.55)]' : 'opacity-80 group-hover:opacity-100',
              )}
            />
          </Link>

          <Link
            href="/whos-that-pokemon"
            aria-current={isGame ? 'page' : undefined}
            title={t('nav.game')}
            className="flex items-center shrink-0 group"
          >
            <img
              src="/assets/quiz.png"
              alt={t('nav.game')}
              className={cn(
                'h-12 w-auto shrink-0 object-contain transition group-hover:scale-[1.03]',
                isGame ? 'drop-shadow-[0_2px_6px_rgba(237,74,8,0.55)]' : 'opacity-80 group-hover:opacity-100',
              )}
            />
          </Link>
          <LanguageToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
