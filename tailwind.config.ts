import type { Config } from 'tailwindcss';

/**
 * Paleta basada en variables CSS para soportar dos temas (oscuro/claro) sin
 * tener que duplicar clases con prefijo `dark:`.
 *
 * Cómo funciona:
 *  - Cada token (`ink-50`, `ink-700`, etc.) resuelve a `rgb(var(--ink-50) / <alpha-value>)`.
 *  - Las variables se definen en `globals.css` en `:root` (modo oscuro por defecto)
 *    y en `:root[data-theme='light']` (modo claro).
 *  - La sintaxis `<alpha-value>` permite seguir usando `bg-ink-900/60`, `text-ink-100/80`, etc.
 *
 * Semántica de la escala "ink":
 *  - ink-900 = canvas (fondo de la página)
 *  - ink-700 = elevated (paneles destacados)
 *  - ink-50  = texto fuerte (titulares)
 *  - ink-100 = texto primario
 *  - ink-300 = texto secundario / metadata
 *  - ink-400 = texto más apagado / placeholders
 *
 * Los valores se "voltean" en modo claro: ink-900 sigue siendo el canvas pero
 * pasa de #08070a a #f7f6f2; ink-100 sigue siendo "primary text" pero pasa de
 * #ecebe4 a un gris muy oscuro. No hay que refactorizar las clases.
 *
 * El token `overlay` reemplaza los "white/N" que se usaban como velo encima
 * de fondos oscuros — en modo claro, debe ser negro.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: 'rgb(var(--ink-50) / <alpha-value>)',
          100: 'rgb(var(--ink-100) / <alpha-value>)',
          200: 'rgb(var(--ink-200) / <alpha-value>)',
          300: 'rgb(var(--ink-300) / <alpha-value>)',
          400: 'rgb(var(--ink-400) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          900: 'rgb(var(--ink-900) / <alpha-value>)',
        },
        // Velo translúcido cuya inclinación se invierte según el tema.
        overlay: 'rgb(var(--overlay) / <alpha-value>)',
        // Accent de marca — el naranja se mantiene en ambos temas (es el color identitario).
        flame: {
          50: '#fff5ed',
          100: '#ffe3cf',
          200: '#ffc098',
          300: '#ff9457',
          400: '#ff6a26',
          500: '#ed4a08',
          600: '#c63504',
          700: '#9a2807',
          800: '#7c220e',
          900: '#691f10',
        },
        electric: {
          400: '#ffd23f',
          500: '#f7b500',
        },
        leaf: {
          400: '#5fc46a',
          500: '#3ea748',
        },
        water: {
          400: '#3aa6ff',
          500: '#1d7dd9',
        },
        // Tipos Pokémon — paleta canónica oficial, idéntica en ambos temas.
        type: {
          normal: '#a8a878',
          fire: '#f08030',
          water: '#6890f0',
          electric: '#f8d030',
          grass: '#78c850',
          ice: '#98d8d8',
          fighting: '#c03028',
          poison: '#a040a0',
          ground: '#e0c068',
          flying: '#a890f0',
          psychic: '#f85888',
          bug: '#a8b820',
          rock: '#b8a038',
          ghost: '#705898',
          dragon: '#7038f8',
          dark: '#705848',
          steel: '#b8b8d0',
          fairy: '#ee99ac',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'pokedex': '0 20px 40px -20px rgba(237, 74, 8, 0.45), 0 8px 24px -12px rgba(0,0,0,0.35)',
        'inset-deep': 'inset 0 2px 6px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgb(var(--overlay) / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--overlay) / 0.04) 1px, transparent 1px)',
        'radial-spot':
          'radial-gradient(circle at 30% 20%, rgba(255,210,63,0.18), transparent 55%), radial-gradient(circle at 80% 90%, rgba(237,74,8,0.22), transparent 50%)',
      },
      backgroundSize: {
        'grid-32': '32px 32px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 3.5s linear infinite',
        'pop': 'pop 0.25s ease-out',
        'shake': 'shake 0.38s cubic-bezier(.36,.07,.19,.97)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(120%)' },
        },
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Feedback de fallo en el input del juego — la curva ease asimétrica
        // hace el primer impulso más nítido y el resto se atenúa.
        shake: {
          '10%,90%': { transform: 'translateX(-1px)' },
          '20%,80%': { transform: 'translateX(2px)' },
          '30%,50%,70%': { transform: 'translateX(-4px)' },
          '40%,60%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
