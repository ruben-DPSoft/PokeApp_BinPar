# Pokédex · Real-time PokéAPI

> Prueba técnica para **BinPar** — Pokédex moderna sobre **Next.js 14 (App Router)**, **TypeScript estricto**, **Tailwind CSS** y **Zustand**, consumiendo en tiempo real la [PokéAPI](https://pokeapi.co/).

**Demo en vivo:** [pokeapp-rubenrganga.vercel.app](https://pokeapp-rubenrganga.vercel.app/) — desplegada en **Vercel**.

Más allá del enunciado: **tres modos de visualización** (Cards TCG con paralaje 3D, Tabla densa, Pokédex con marcado de capturados + estadísticas en vivo), **comparador** de dos Pokémon con radar chart (Recharts) y barras, **mini-juego** "¿Quién es ese Pokémon?" con tres modos y tolerancia a typos (Levenshtein), **tema claro/oscuro** con anti-flash, **i18n ES/EN** sin librerías (incluidos los triggers de evolución, p. ej. "Piedra Agua" / "Water Stone"), búsqueda por nombre con expansión a línea evolutiva **y por número**, filtros **multi-select** con efecto neón, **habilidades y movimientos iniciales localizados** en el detalle con tooltips propios compatibles con táctil, **suite de tests** (26 unit tests con Vitest sobre lógica pura), y 100% responsive.

---

## Tabla de contenidos

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Despliegue](#despliegue)
- [Cómo ejecutarlo](#cómo-ejecutarlo)
- [Tests](#tests)
- [Estructura](#estructura)
- [Arquitectura](#arquitectura)
- [UX y estilo](#ux-y-estilo)
- [Tema y i18n](#tema-y-i18n)
- [Accesibilidad y responsive](#accesibilidad-y-responsive)
- [Autoría y workflow con IA](#autoría-y-workflow-con-ia)
- [Siguiente iteración](#siguiente-iteración)

---

## Funcionalidades

> **Resumen ejecutivo** — Lo exigido por el enunciado está cumplido al 100 %. Sobre esa base se ha entregado una capa adicional de funcionalidad (tres modos de visualización, tema claro/oscuro, i18n, mini-juego, tooltips de habilidades/movimientos, etc.) que aproximadamente **triplica el alcance funcional** original. La separación "requisito → extra" se mantiene visible debajo para que el revisor pueda auditar cada pieza por separado.

### ✅ Requisitos del enunciado · Cumplidos

| #   | Requisito                                                  | Cómo se cumple                                                                              | Dónde mirarlo                                                                                                                                                 |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Listado ordenado por id                                    | Render del array ya ordenado al adaptar                                                     | [`PokemonListing`](src/components/views/PokemonListing.tsx)                                                                                                   |
| 2   | Nombre, generación y tipos visibles                        | Las 3 vistas (Cards/Tabla/Pokédex) los muestran                                             | [`CardsView`](src/components/views/CardsView.tsx) · [`TableView`](src/components/views/TableView.tsx) · [`PokedexView`](src/components/views/PokedexView.tsx) |
| 3   | Filtro por tipo                                            | Multi-select con semántica OR, no single-select                                             | [`TypeFilter`](src/components/controls/TypeFilter.tsx)                                                                                                        |
| 4   | Filtro por generación                                      | Idem, multi-select                                                                          | [`GenerationFilter`](src/components/controls/GenerationFilter.tsx)                                                                                            |
| 5   | Búsqueda en tiempo real con evoluciones                    | Texto → matches directos **+ expansión a la familia evolutiva** vía adyacencia precomputada | [`useFilteredPokemon`](src/hooks/useFilteredPokemon.ts)                                                                                                       |
| 6   | Página de detalle (imagen, gen, tipos, evoluciones, stats) | SSR del fetch + Client view para idioma reactivo                                            | [`/pokemon/[id]`](src/app/pokemon/%5Bid%5D/page.tsx)                                                                                                          |
| 7   | Navegación entre evoluciones                               | Cada eslabón es un `Link` al detalle correspondiente                                        | [`EvolutionChain`](src/components/detail/EvolutionChain.tsx)                                                                                                  |
| 8   | Pokémon actual resaltado en su línea evolutiva             | Ring de neón + scale en el eslabón con `isCurrent`                                          | [`EvolutionChain`](src/components/detail/EvolutionChain.tsx)                                                                                                  |
| 9   | Estado del listado preservado al volver del detalle        | Store Zustand en memoria + listener `passive` de scroll + restore al re-montar              | [`filters`](src/store/filters.ts) · [`useRestoreScroll`](src/hooks/useRestoreScroll.ts)                                                                       |
| 10  | TypeScript + Next.js + npm                                 | TS estricto con `noUncheckedIndexedAccess`, Next 14 App Router                              | `tsconfig.json` · `package.json`                                                                                                                              |

### Extras (sobre los requisitos)

#### Vistas y modos

- **Cards TCG editorial**: gradiente del tipo, watermark Pokéball + número Dex gigante de fondo, sprite con `translateZ(40px)`, **tilt 3D** y reflejo especular siguiendo al cursor ([`useCardTilt`](src/hooks/useCardTilt.ts)).
- **Tabla densa**: layout en grid con columnas adaptativas (sprite/dex/nombre/tipos/generación); en móvil colapsa a 2 columnas con metadata apilada.
- **Modo Pokédex**: marcar capturados, **silueta** de no capturados, glifos de tipo (sin nombre, con tooltip), acceso al detalle con icono de lupa. Panel superior con **estadísticas en vivo**: progreso global %, barras por generación, distribución por tipo, tipo dominante de la colección.

#### Mini-juego: ¿Quién es ese Pokémon? ([`/whos-that-pokemon`](src/app/whos-that-pokemon/page.tsx))

- Silueta + **cuenta atrás** con ring SVG circular que cambia de verde a ámbar a rojo y sprite pulsando en los últimos segundos.
- **Tres modos**: Fácil (20 s, sólo Gen 1), Normal (15 s, respeta los filtros activos en el listado), Difícil (10 s, totalmente random). Cambio de modo entre rondas.
- Input con normalización tolerante (sin tildes/mayúsculas/puntuación) **+ tolerancia a typos** vía Levenshtein con umbral por longitud (1 typo en nombres `<10` chars, 2 typos en `≥10`).
- Feedback de fallo: sacudida visual + borde rojo persistente hasta que edites; el texto **se mantiene** para corregir sin reescribir todo. Autofoco en cada ronda.
- **Racha actual + mejor racha** persistida. Acertar **auto-captura** el Pokémon en tu Pokédex si aún no estaba ahí — conecta el juego con la colección.
- "Rendirse" o agotar el tiempo revela el Pokémon y resetea la racha. Botón "Siguiente" enfocado automáticamente para encadenar partidas con Enter.

#### Comparador ([`/compare`](src/app/compare/page.tsx))

- **Dos slots side-by-side** con picker propio cada uno; búsqueda dentro del picker reutiliza la lógica del listado (incluida la **expansión a la familia evolutiva**) y se activa a partir de 3 caracteres.
- **Radar chart** ([Recharts](https://recharts.org/)) con las 6 stats canónicas en 2 series superpuestas + **barras horizontales** custom con valores numéricos y escala 0-200.
- **Colores dinámicos según el tipo primario** de cada Pokémon. Si ambos comparten color, se intenta el tipo secundario del segundo; si tampoco resuelve, cae a una paleta de fallback de 4 colores claramente distintos.
- **Resumen** con totales de stats (`/600`) por Pokémon, con borde y total tintado al color de cada uno.
- **Estado en URL** (`?a=25&b=6`) — la comparativa es shareable. Sin defaults: empieza vacío y el usuario elige.
- Botón **Intercambiar** para rotar A↔B sin re-buscarlos.

#### Búsqueda y filtros

- **Búsqueda inteligente**: por nombre con **expansión a la familia evolutiva** (precomputada con `fetchEvolutionAdjacency`), o por número (cruda o padded a 4 dígitos: `25` / `025` / `#0025`).
- **Multi-select de tipos y generaciones** con semántica OR. Seleccionar "Eléctrico + Volador" muestra Zapdos, Pikachu, Pidgey y todos los duales.
- **Filtros estilo TCG**: pill con disco coloreado y glifo oficial PokéAPI (Scarlet/Violet). Activo: halo de neón multi-capa (anillo + glow + difusión + inner). Generaciones como "monedas" full-width con rampa cromática propia.
- **Filtros colapsables** individual y globalmente; los chips de filtros activos siempre se ven aunque el panel esté cerrado ([`ActiveFilters`](src/components/controls/ActiveFilters.tsx)).
- **Paginación incremental** con `IntersectionObserver` (60 en 60).

#### Detalle enriquecido

- **Descripción Pokédex localizada** con prioridad de juegos modernos (Scarlet/Violet → … → Red/Blue), servida en ambos idiomas en el payload para alternar sin re-fetch.
- **Habilidades** con nombre y descripción localizados — fetch paralelo a `/ability/{name}` con `Promise.all`; marca para habilidades ocultas.
- **Movimientos iniciales**: top 6 por menor nivel de aprendizaje (level-up only), con **tipo, nivel y descripción** localizada. No estaba en el enunciado.
- **Tooltips propios** ([`InfoTooltip`](src/components/common/InfoTooltip.tsx)): hover/focus en desktop, **tap-to-pin** en táctil, cierre con tap-fuera o ESC. `pointerType` discrimina los eventos sintéticos de Android.
- **Línea evolutiva** con el Pokémon actual destacado (ring de neón + scale-105). Cada nodo lleva **su propio trigger** (clave para ramificaciones como Eevee), con:
  - Captura de `time_of_day` → diferencia Espeon (alta amistad de día) de Umbreon (de noche).
  - Captura de `location` → Leafeon/Glaceon ya no aparecen ambos como "level up".
  - **Triggers bilingües** (`{ es, en }`): mapa de 25 objetos de evolución comunes en español oficial (Piedra Agua, Roca del Rey, Manto Férreo, Escama Bella…) + fallback título-case.
- **Stat bars** con color por intensidad y total de stats agregado en el hero.

#### Internacionalización y tema

- **i18n ES/EN** sin librerías — diccionario plano tipado (`DictKey` se infiere; `en` debe satisfacer `Record<DictKey, string>`).
- Interpolación `{placeholder}` y soporte para alternar **sin re-fetch** (descripción Pokédex, habilidades y movimientos vienen en ambos idiomas).
- **Tema claro/oscuro** con persistencia + script anti-flash inline en `<head>` (cero parpadeo al recargar con tema claro).
- Toggles de tema e idioma en el header.

#### Engineering

- **Server/Client split** razonado: fetch en RSC (SEO, LCP, cache HTTP), hidratación en cliente para interacción (toggles, tilt, idioma).
- **Cache HTTP** `next: { revalidate: 24h }` + **SWR** en cliente con dedupe.
- **19 fetches** para el índice completo (18 `/type` + 1 `/pokemon`) en lugar de 1025 ingenuas.
- **Hidratación paralela** en el detalle (habilidades + movimientos con `Promise.all`) para no encadenar latencias.
- **Adaptadores** `raw → dominio` en `lib/pokemon/api.ts` (exportados y testeados): si la API cambia, sólo cambia el adaptador.
- **Lógica pura separada de hooks** para poder testearla sin React: `filterPokemon` (extraído de `useFilteredPokemon`), `levenshtein`/`normalizeGuess`/`typoTolerance` (extraídos del componente del juego).
- **TypeScript estricto** con `noUncheckedIndexedAccess`.
- **Suite de tests** (Vitest) sobre la lógica pura — ver [Tests](#tests).

#### Pulido visual

- **SVG `feColorMatrix`** con threshold de luminancia para extraer el glifo de los PNGs opacos oficiales de PokéAPI (filtros `glyph-fill-white` / `glyph-fill-dark` definidos en `<body>`).
- **Marca de agua tipográfica** del número Dex en cards y hero del detalle.
- **Scanline animada** sobre el sprite del hero; **shine** desincronizado entre cards (12 fases × 0.66 s).
- Stacking-context resuelto entre secciones con `backdrop-filter` para que los tooltips se pinten sobre paneles posteriores.

#### Estado y persistencia

- 4 stores Zustand separados por persistencia: `filters` (memoria), `pokedex` / `theme` / `locale` (localStorage v1).
- **Scroll restauration** continuo con listener `passive` + RAF + `useRestoreScroll` al re-montar.
- `Set<number>` interno en `pokedex` para `has` O(1), serializado a `number[]` para JSON.

#### Accesibilidad

- ARIA roles completos (`group`, `aria-pressed`, `aria-expanded`, `aria-current`, `aria-describedby`, `progressbar`, `tooltip`).
- Focus visible con anillo de marca; navegación completa por teclado.
- `prefers-reduced-motion`: tilt 3D se desinstala, animaciones CSS se neutralizan.
- Contraste AA en todos los textos; `text-shadow` sobre tipos claros (eléctrico, hada, hielo).
- Tooltips/labels en todos los iconos sin texto (discos de tipo, lupa, toggles).

---

## Stack

| Pieza             | Elección                                         | Por qué                                                                                                                                                             |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**     | Next.js 14 (App Router)                          | RSC para detalle (SEO, LCP), `loading.tsx`/`error.tsx`/`not-found.tsx` adyacentes a la ruta.                                                                        |
| **Lenguaje**      | TypeScript estricto (`noUncheckedIndexedAccess`) | Caza bugs reales en arrays/objetos parciales.                                                                                                                       |
| **Estilos**       | Tailwind + tokens propios (CSS variables)        | Paleta `ink`/`flame` + colores canónicos de tipos. Tema oscuro/claro vía vars sin duplicar clases.                                                                  |
| **Estado**        | Zustand                                          | `filters` sin persist (memoria de sesión); `pokedex`/`theme`/`locale`/`game` con middleware `persist`.                                                              |
| **Fetch & cache** | SWR + `fetch` nativo de Next                     | Dedupe en cliente; cache 24h en server con `revalidate`.                                                                                                            |
| **Iconos**        | SVG inline + filtros SVG en `<body>`             | Sin icon-sets externos; los filtros extraen el glifo de los PNGs oficiales de PokéAPI con `feColorMatrix`.                                                          |
| **Imágenes**      | `<img>` al CDN raw de PokeAPI                    | Lazy loading nativo; sin coste de optimizer sobre un CDN ya optimizado.                                                                                             |
| **Visualización** | Recharts (sólo en `/compare`)                    | Radar chart con 6 ejes y 2 series superpuestas — hacerlo a mano hubiera duplicado el esfuerzo. Code-split por ruta: el bundle de Recharts sólo lo carga `/compare`. |
| **Testing**       | Vitest + `@vitejs/plugin-react`                  | Soporte TS sin transform, sintaxis 1:1 con Jest, arranque rápido. Tests sobre lógica pura (sin renderizar React).                                                   |

Más profundo en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) y [`docs/DESIGN.md`](docs/DESIGN.md).

---

## Despliegue

La aplicación está desplegada en **Vercel** (la plataforma de los creadores de Next.js, integración nativa con App Router, RSC y `revalidate`).

- **URL de producción**: [https://pokeapp-rubenrganga.vercel.app/](https://pokeapp-rubenrganga.vercel.app/)
- **CI/CD**: cada push a `main` dispara un build automático en Vercel; los PRs generan **preview deployments** con URL propia.
- **Build command**: `npm run build` · **Output**: `.next` (serverless + edge, según ruta).
- **Cache**: `fetch` con `next: { revalidate: 86400 }` en server → respuestas de PokéAPI cacheadas 24 h en la edge de Vercel, dedupe en cliente con SWR.

> Tip: la primera carga construye el índice de 1025 Pokémon en memoria (~19 fetches). En producción esos fetches viajan por la CDN de Vercel con cache HTTP, así que las siguientes visitas son prácticamente instantáneas.

---

## Cómo ejecutarlo

**Requisitos:** Node ≥ 18.17 (probado con 22.16).

```bash
npm install
npm run dev       # http://localhost:3000

npm run build     # build de producción
npm start

npm run lint        # ESLint (config Next)
npm run type-check  # tsc --noEmit

npm test            # Vitest una vez (modo CI)
npm run test:watch  # Vitest en modo watch
```

> **Primera carga**: la app construye en memoria un índice de 1025 Pokémon (~19 fetches) y otro de cadenas evolutivas. Luego todo es local — el filtrado y la búsqueda son instantáneos.

---

## Tests

26 unit tests con **Vitest** sobre la lógica pura. La estrategia es testear la "lógica que no es React" (filtrado, matching, adaptadores, normalización) — los componentes y hooks se cubrirían con `@testing-library/react` y Playwright en una iteración posterior.

| Archivo                                                            | Cobre                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/lib/game/match.test.ts`](src/lib/game/match.test.ts)         | `normalizeGuess` (acentos, puntuación, `Mr. Mime`/`Nidoran♀`), `levenshtein` (caso base + 3 operaciones), `typoTolerance` (umbrales por longitud), `isAcceptableGuess` (aceptación de "casi" + rechazo de vacíos/colisiones tipo Nidoran♀/♂).                                                                 |
| [`src/lib/pokemon/filter.test.ts`](src/lib/pokemon/filter.test.ts) | `filterPokemon`: sin criterios, multi-tipo (OR), multi-generación, búsqueda numérica (cruda + padded 4 dígitos), búsqueda por nombre **con expansión a la familia evolutiva**, orden prefix-first, combinación tipo + búsqueda.                                                                               |
| [`src/lib/pokemon/api.test.ts`](src/lib/pokemon/api.test.ts)       | `idFromUrl`, `cleanFlavor`, `adaptSummary`/`adaptDetail`, `flattenChain` (ramas y stages), `humanizeTrigger` (bilingüe ES/EN, items mapeados a piedras oficiales, `time_of_day` para Espeon/Umbreon, `location` para Leafeon/Glaceon, fallback título-case), `pickFlavorText` (prioridad de juegos modernos). |

Para extraer la lógica del hook a una función testeable, `useFilteredPokemon` se simplificó a un wrapper sobre `filterPokemon(dataset, adjacency, criteria)` (función pura). Misma estrategia con los helpers del juego, ahora en `src/lib/game/match.ts`.

---

## Estructura

```
src/
├── app/                          # App Router de Next.js
│   ├── layout.tsx                # Header/footer/metadata + script anti-flash + SVG filter defs
│   ├── page.tsx                  # Página principal (Server)
│   ├── globals.css               # Reset + tokens CSS + componentes Tailwind
│   ├── error.tsx                 # Error boundary global
│   ├── pokemon/[id]/
│   │   ├── page.tsx              # Detalle (Server fetch → Client view)
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   ├── compare/
│   │   └── page.tsx              # Comparador de dos Pokémon (estado en URL)
│   └── whos-that-pokemon/
│       └── page.tsx              # Mini-juego de silueta + countdown
│
├── components/
│   ├── common/
│   │   ├── TypeBadge.tsx         # Pill con disco TCG + nombre (tabla, hero)
│   │   ├── TypeDisc.tsx          # Sólo el disco, sin texto (corners de cards, Pokédex)
│   │   ├── PokemonSprite.tsx     # <img> con fallback + modo silueta
│   │   ├── InfoTooltip.tsx       # Tooltip propio: hover/focus + tap-to-pin
│   │   ├── StatBar.tsx
│   │   └── Skeleton.tsx
│   ├── controls/
│   │   ├── SearchBar.tsx
│   │   ├── TypeFilter.tsx        # Multi-select, brick 9+9 / grid 6 / selector móvil
│   │   ├── GenerationFilter.tsx  # Multi-select, monedas full-width / selector móvil
│   │   ├── ViewModeToggle.tsx
│   │   ├── ActiveFilters.tsx     # Chips removibles, uno por filtro activo
│   │   ├── FiltersPanel.tsx      # Wrapper con colapso global (mobile)
│   │   ├── CollapsibleHeader.tsx # Cabecera + chevron reutilizada por ambos filtros
│   │   ├── LanguageToggle.tsx
│   │   └── ThemeToggle.tsx
│   ├── views/
│   │   ├── PokemonListing.tsx
│   │   ├── CardsView.tsx
│   │   ├── PokemonCard.tsx       # Card 3D estilo TCG editorial
│   │   ├── TableView.tsx
│   │   ├── PokedexView.tsx
│   │   └── PokedexStats.tsx
│   ├── detail/
│   │   ├── PokemonDetailView.tsx
│   │   ├── EvolutionChain.tsx
│   │   └── PokedexToggleClient.tsx
│   ├── game/
│   │   └── WhoIsThatPokemon.tsx  # Mini-juego: silueta + countdown + Levenshtein
│   ├── compare/
│   │   ├── ComparatorView.tsx    # Layout + colores por tipo, estado URL
│   │   ├── PokemonSlot.tsx       # Slot con picker (búsqueda + evolución)
│   │   ├── StatsRadar.tsx        # Recharts <RadarChart> con 6 stats
│   │   ├── StatsBars.tsx         # Barras horizontales custom
│   │   └── ComparatorSummary.tsx # Totales (/600) por Pokémon
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── HomeHero.tsx
│
├── hooks/
│   ├── useDebounce.ts
│   ├── usePokemonData.ts         # SWR wrappers
│   ├── useFilteredPokemon.ts     # Filtros + búsqueda (nombre/número/evolución)
│   ├── useRestoreScroll.ts
│   └── useCardTilt.ts            # Tilt 3D + specular siguiendo al cursor
│
├── lib/
│   ├── utils.ts                  # cn(), formatDex(), TYPE_COLOR
│   ├── i18n/
│   │   ├── dictionaries.ts       # ES + EN, tipado estricto vía keyof
│   │   └── useT.ts
│   ├── game/
│   │   ├── match.ts              # Levenshtein + normalización + tolerancia
│   │   └── match.test.ts         # Tests Vitest
│   └── pokemon/
│       ├── api.ts                # Cliente PokéAPI + adaptadores raw→dominio (exportados)
│       ├── api.test.ts           # Tests de adaptadores y humanizeTrigger
│       ├── filter.ts             # Lógica pura del filtrado (extraída del hook)
│       ├── filter.test.ts        # Tests Vitest
│       ├── generations.ts        # Rangos de id por generación
│       └── sprites.ts            # URLs de sprites + iconos de tipos
│
├── store/
│   ├── filters.ts                # Multi-select arrays + scroll + estados de colapso
│   ├── pokedex.ts                # Colección persistida en localStorage
│   ├── game.ts                   # Mejor racha del mini-juego, persist
│   ├── theme.ts                  # Tema activo (dark/light), persist
│   └── locale.ts                 # Idioma activo (es/en), persist
│
└── types/
    ├── pokemon.ts                # Tipos de dominio
    └── global.d.ts               # Declaraciones globales (CSS modules)

public/
└── assets/                       # Logo, iconos de nav (quiz, vs, random, Pokéball)

vitest.config.ts                  # Plugin React + alias `@/` → `./src`
```

**Reglas de capas:**

- `lib/pokemon/api.ts` es la **única** capa que habla con PokéAPI; el resto trabaja con tipos de dominio.
- `store/` guarda estado transversal (compartido entre páginas); el estado local vive en `useState`.
- `hooks/` no toca la API directamente — usa `lib/` y `store/`.

---

## Arquitectura

### Capa de datos

```
PokéAPI ──► api.ts (adapters) ──► tipos de dominio ──► hooks SWR ──► componentes
```

Adaptadores puros (`adaptSummary`, `adaptDetail`, `flattenChain`) que aíslan el resto del proyecto del shape exacto de la PokéAPI. Si la API cambia, sólo cambia el adaptador.

### RSC vs Client Components

- **Server**: `layout.tsx`, ambas `page.tsx`, fetch del detalle. Entregan HTML pre-renderizado con datos.
- **Client**: todo lo que consume stores (filtros, tema, idioma) o necesita interacción (toggles, tilt, drop-downs).

Las páginas de detalle hacen `fetch` en server pero pasan los datos a un Client Component (`PokemonDetailView`) que usa `useT` — best of both worlds: SSR de datos + reactividad de UI/idioma.

### Stores

| Store     | Persistencia    | Propósito                                                                                                                           |
| --------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `filters` | Memoria         | Búsqueda, filtros multi-select, view-mode, scroll, estados de colapso. Sobrevive a navegación, no a recarga (lo pide el enunciado). |
| `pokedex` | localStorage v1 | Colección personal. `Set<number>` internamente (O(1) `has`); serializado a `number[]`.                                              |
| `theme`   | localStorage v1 | `dark` / `light`.                                                                                                                   |
| `locale`  | localStorage v1 | `es` / `en`.                                                                                                                        |
| `game`    | localStorage v1 | Mejor racha del mini-juego. La racha actual es de sesión (no persiste).                                                             |

### Búsqueda con expansión evolutiva

Cuando el término es **texto**, `useFilteredPokemon` busca matches directos por subcadena, los expande a toda la familia vía un `Map<speciesId, speciesId[]>` (precomputado una vez al arrancar con `fetchEvolutionAdjacency`), y devuelve la unión. Los matches que empiezan por el término van primero (UX clásica).

Cuando el término es **numérico**, busca por id (forma cruda o padded a 4 dígitos): `25` → #25, `025` → #25, `1` → todos los que contienen "1".

### Datos masivos sin saturar la API

El listado necesita `types[]` por Pokémon. En lugar de 1025 fetches a `/pokemon/{id}`, hago **18 fetches a `/type/{name}`** + 1 a `/pokemon?limit=1025`. Total: **19 requests** vs 1025 ingenuas. La generación se deriva del id sin llamadas (rangos canónicos hard-codeados).

### Persistencia de scroll/filtros

Al volver del detalle, el filtro y la posición se preservan: el scroll se guarda continuamente en `filters.listScrollY` con un listener `passive` + RAF, y al re-montar el listado, [`useRestoreScroll`](src/hooks/useRestoreScroll.ts) hace `window.scrollTo` cuando las filas están pintadas.

---

## UX y estilo

### Identidad

- Paleta "Pokédex retro-futurista": fondo oscuro con doble radial-gradient cálido, marca `flame` (#ed4a08).
- Tipografía display (Space Grotesk) en headlines, sans-serif clásica en cuerpo.
- Detalles: marca de agua tipográfica del número Dex en cards y hero, scanline animada sobre sprites, badges con colores canónicos oficiales.

### Filtros estilo TCG

- **Tipo**: cada botón es una pill con fondo oscuro derivado del color del tipo (`color-mix` con negro 22-48%), disco interior a saturación plena con borde oscuro grueso, glifo extraído del PNG oficial vía SVG filter (`feColorMatrix` con threshold de luminancia). Activo: halo de neón multi-capa (anillo + glow + difusión + inner). Multi-select: varios tipos brillan a la vez sin solaparse.
- **Generación**: monedas full-width (9 columnas), cada una con número grande + región. Rampa cromática derivada de tipos asociados a cada región (Kanto=flame, Hoenn=water, Sinnoh=dragon…).
- **Layouts responsivos**: `xl+` brick 9+9 / `md-xl` grid 6 cols / `<md` selector colapsable con multi-select inline.

### Card 3D

Layout estilo "carta editorial":

- Banner del tipo + watermark Pokéball + **número Dex gigante de fondo**.
- Nombre arriba; sprite centrado con paralaje 3D (`useCardTilt` mapea cursor → `--tx/--ty/--mx/--my`).
- Bottom-left: discos de tipo (`TypeDisc`, sólo glifo); bottom-right: Gen·Región (centrados verticalmente entre sí).
- Tilt en `rotateX/rotateY` + specular radial siguiendo al cursor con `mix-blend-mode: overlay`.

---

## Tema y i18n

### Tema (claro/oscuro)

Variables CSS, no `dark:` prefix:

```css
:root {
  --ink-900: 8 7 10;
  --overlay: 255 255 255;
}
:root[data-theme="light"] {
  --ink-900: 247 246 242;
  --overlay: 30 28 22;
}
```

Cambiar tema = cambiar un atributo en `<html>`. **No re-renderiza React**.

**Anti-flash**: script inline minificado en `<head>` lee `localStorage` antes de pintar nada y fija `data-theme` + `<html lang>`. Cero parpadeo al recargar con tema claro.

### i18n

Sin dependencias externas. Diccionario plano + hook custom:

```ts
const t = useT();
t("detail.toggle.add", { name: "Pikachu" });
```

- Diccionarios tipados estrictamente (`DictKey` se infiere del `es`; `en` debe satisfacer `Record<DictKey, string>`).
- Interpolación con `{placeholder}`. Sin pluralización ICU.
- Store con persist; sincronización de `<html lang>` desde el script anti-flash.
- Texto Pokédex servido en ambos idiomas en el payload del detalle (ES con fallback a EN), con prioridad de juegos modernos para mayor calidad de traducción.

---

## Accesibilidad y responsive

### Responsive

| Vista/control          | `<sm`               | `sm-md`           | `md-lg`         | `lg-xl`     | `xl+`         |
| ---------------------- | ------------------- | ----------------- | --------------- | ----------- | ------------- |
| Cards                  | 2 cols              | 3                 | 4               | 5           | 5             |
| TypeFilter             | selector colapsable | selector          | grid 6 cols     | grid 6 cols | **brick 9+9** |
| GenerationFilter       | selector colapsable | selector          | grid 9 cols     | grid 9 cols | grid 9 cols   |
| Panel filtros          | colapsable global   | colapsable global | siempre visible | —           | —             |
| Disco de tipo en cards | 1.7rem              | 2.4rem            | 2.4rem          | 2.4rem      | 2.4rem        |

### Accesibilidad

- ARIA roles (`group`, `aria-pressed`, `aria-expanded`, `aria-current`, `progressbar`).
- Focus visible con anillo de marca.
- `prefers-reduced-motion`: hooks como `useCardTilt` se desinstalan; animaciones CSS se neutralizan.
- Texto blanco con `text-shadow` para legibilidad sobre cualquier tipo coloreado.
- Contraste mínimo AA en todos los textos.
- Alt-text descriptivos en sprites; tooltips/labels en discos sin texto.

---

## Autoría y workflow con IA

> **Modelo de trabajo**: el diseño y las decisiones del proyecto son míos. La IA — **Claude (Anthropic)** — actuó como pareja de implementación: yo definía el componente y su código base, su contrato y la dirección; el modelo redactaba la implementación; yo revisaba, ajustaba y refactorizaba. Cada commit ha pasado por mi cabeza antes de existir.

**Qué hice yo (decisiones, no código)**

- **Arquitectura de la app**: separar `lib/pokemon/api.ts` como única capa que habla con PokéAPI, dejando al resto trabajar con tipos de dominio normalizados. Si el shape de la API cambia, sólo cambia el adaptador.
- **Estrategia de fetch del listado**: en lugar de 1025 requests ingenuas a `/pokemon/{id}`, usar **18 endpoints `/type/{name}`** + 1 al listado → 19 fetches totales para construir el índice completo. Generación derivada del id sin llamadas adicionales (rangos canónicos hard-codeados).
- **Server/Client split**: fetch en RSC (SEO, LCP, cache HTTP), interacción en Client. La página de detalle hace fetch en servidor pero entrega los datos a un Client Component que consume `useT` — SSR + reactividad de UI/idioma sin perder ninguno de los dos.
- **Estado en stores Zustand separados por persistencia**: `filters` en memoria (lo pide el enunciado), `pokedex` / `theme` / `locale` / `game` en `localStorage`. `Set<number>` interno para `has` O(1), serializado a `number[]`.
- **i18n sin librerías**: diccionario plano con tipado estricto donde la fuente de verdad es `es` y `en` debe satisfacer `Record<DictKey, string>`. La descripción Pokédex, habilidades y movimientos se sirven en ambos idiomas en el payload para alternar idioma sin re-fetch.
- **Tema con CSS variables** en `<html>` en lugar de `dark:` prefix → cambiar tema no re-renderiza React. Anti-flash con script inline en `<head>` antes del primer paint.
- **Multi-select con semántica OR**: el enunciado pedía "filtro por tipo / generación" — interpretado en singular. Elevarlo a multi-select cambia la UX significativamente y es una decisión explícita de producto.
- **Búsqueda con expansión evolutiva**: cuando el término coincide con un Pokémon, se expande a toda su línea evolutiva mediante un `Map<speciesId, speciesId[]>` precomputado al arrancar.
- **Glifos de tipo extraídos por SVG `feColorMatrix`** con threshold de luminancia. Los PNGs oficiales de PokéAPI son opacos; un `mask-image` CSS dejaba un rectángulo visible. Resuelto con dos filtros (`glyph-fill-white` / `glyph-fill-dark`) y selección automática por luminancia del color del tipo.
- **Mini-juego "¿Quién es ese Pokémon?"** integrado con la Pokédex: acertar añade el Pokémon a la colección si aún no estaba ahí. Tres modos (Fácil/Normal/Difícil) con durations y pools distintos. Levenshtein con umbral por longitud para tolerar typos.
- **Comparador con colores derivados del tipo primario**: cada Pokémon "trae" su color al radar / barras / resumen. Si ambos comparten color, se prueba el tipo secundario del segundo; si tampoco resuelve, paleta de fallback de 4 colores distintos. Estado de la comparativa en URL (`?a=25&b=6`) → shareable.
- **Triggers de evolución bilingües**: cambié `EvolutionNode.trigger` de `string` a `{ es, en }` y mapeé los 25 objetos de evolución más comunes a su nombre oficial en español (Piedra Agua, Roca del Rey, Manto Férreo, Escama Bella…). El cliente elige idioma sin re-fetch — mismo patrón que ya usaba para flavor text y habilidades. Antes los nombres salían siempre en inglés.
- **Refactor para testabilidad**: extraje `filterPokemon` del hook a `lib/pokemon/filter.ts` y `levenshtein`/`normalizeGuess`/`typoTolerance` del componente del juego a `lib/game/match.ts`. Los hooks/componentes pasaron a ser wrappers triviales sobre funciones puras, lo que permite testearlas con Vitest sin tener que mockear SWR/Zustand/React.
- **Cobertura de los rincones que se rompen sutilmente**: tests sobre búsqueda numérica con padding, expansión evolutiva, Levenshtein con umbrales, fallback de idiomas, normalización de nombres y los casos exóticos de `humanizeTrigger` (Espeon/Umbreon, Leafeon/Glaceon, items mapeados vs no mapeados).
- **Responsive en 3 niveles** explícitos por control (no sólo "móvil vs desktop"): brick 9+9 → grid 6 cols → selector colapsable. Cada control elige su variante según viewport.

**Para qué usé la IA**

- Generar boilerplate Tailwind y limpiar clases redundantes.
- Contrastar enfoques antes de codificar (`Zustand vs Context`, `<img>` vs `next/image`, `mask CSS` vs `SVG filter`).
- Depurar tipos complejos en TypeScript estricto.
- Escribir el primer borrador del código de las vistas, según el contrato que yo definía, los componentes implicados y sobre el que iteraba hasta dar el visto bueno.

**Lo que NO hizo la IA**

- Tomar decisiones arquitectónicas por mí.
- Generar componentes.
- Decidir el alcance (qué entra en el MVP, qué queda fuera).

Cada decisión técnica de la lista anterior la puedo defender una a una en una conversación técnica.

---
