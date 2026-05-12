import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Pokédex · Real-time PokéAPI',
  description:
    'Pokédex en tiempo real construida con Next.js y TypeScript sobre PokéAPI. Listado, búsqueda por cadena evolutiva, filtros y colección personal.',
  applicationName: 'Pokédex BinPar',
  authors: [{ name: 'Rubén Ruiz Gangas' }],
  keywords: ['pokemon', 'pokeapi', 'pokedex', 'nextjs', 'typescript'],
  openGraph: {
    title: 'Pokédex · Real-time PokéAPI',
    description: 'Explora, busca y colecciona Pokémon.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#08070a',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Script anti-flash inyectado SÍNCRONAMENTE en <head>.
 *
 * Lee localStorage para `theme` y `locale` antes de pintar nada y aplica los
 * atributos correspondientes a <html>. Sin esto, los usuarios con tema claro
 * verían un parpadeo oscuro durante ~100 ms en cada navegación, porque el
 * store de Zustand sólo se rehidrata DESPUÉS del primer paint.
 *
 * Es un IIFE minificado a propósito (queremos minimizar tiempo de parse).
 * No hace nada si localStorage no está disponible (privado, deshabilitado).
 *
 * Las cadenas mágicas (`pokedex.theme.v1`, `pokedex.locale.v1`) deben coincidir
 * con `name` en cada store de Zustand — están aquí porque los stores son
 * 'use client' y este script corre antes de cualquier JS de React.
 */
const NO_FLASH_SCRIPT = `(function(){try{
var t=JSON.parse(localStorage.getItem('pokedex.theme.v1')||'null');
var l=JSON.parse(localStorage.getItem('pokedex.locale.v1')||'null');
var theme=(t&&t.state&&t.state.theme)||'dark';
var locale=(l&&l.state&&l.state.locale)||'es';
document.documentElement.dataset.theme=theme;
document.documentElement.lang=locale;
}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      {/* `suppressHydrationWarning` en <body> silencia los avisos cuando
          extensiones del navegador (ColorZilla → `cz-shortcut-listen`,
          Grammarly → `data-gr-c-s-loaded`, LastPass → `data-lpignore`, etc.)
          inyectan atributos en <body> tras el SSR pero antes de hidratar.
          Sólo afecta a este nodo: cualquier mismatch dentro de los hijos
          se seguirá reportando con normalidad. */}
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <GlyphFilterDefs />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

/**
 * Filtros SVG globales para extraer el glifo de los iconos de PokéAPI.
 *
 * Problema: los `symbol_icon` de PokéAPI son PNG opacos completos (sin
 * transparencia) con un glifo blanco encima de un fondo del color del tipo.
 * Con `mask-mode: luminance` aparecen unos rectángulos visibles dentro del
 * disco porque el fondo coloreado mantiene ~38% de opacidad en la máscara.
 *
 * Solución: en lugar de máscara CSS, aplicamos un `feColorMatrix` SVG que
 * computa el alfa de salida como `10·luma − 8`. Es decir:
 *   - luma > 0.80 (los píxeles blancos del glifo) → alfa positivo → visibles
 *   - luma ≤ 0.80 (cualquier color de tipo, incluso amarillo eléctrico) →
 *                                                       alfa ≤ 0 → invisibles
 *
 * El threshold 0.80 se elige tras tabular las luminancias de los 18 colores
 * canónicos: el más claro (eléctrico amarillo) cae exactamente en 0.80, así
 * que la pendiente lo lleva a cero sin amputar pixels del glifo (luma 1.0).
 *
 * R/G/B de salida son constantes (las dos primeras tres filas), que dan el
 * color del glifo. Como CSS no puede inyectar variables en feColorMatrix,
 * definimos DOS filtros distintos — `glyph-fill-white` y `glyph-fill-dark` —
 * y el TypeFilter elige cuál aplicar según la luminancia del color del tipo.
 *
 * `width=0 height=0` mantiene el `<svg>` invisible en el DOM. `focusable=false`
 * evita que el SVG entre en el tab order. `aria-hidden` lo oculta de a11y.
 */
function GlyphFilterDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
    >
      <defs>
        <filter id="glyph-fill-white" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    2.126 7.152 0.722 0 -8"
          />
        </filter>
        <filter id="glyph-fill-dark" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.121
                    0 0 0 0 0.113
                    0 0 0 0 0.082
                    2.126 7.152 0.722 0 -8"
          />
        </filter>
      </defs>
    </svg>
  );
}
