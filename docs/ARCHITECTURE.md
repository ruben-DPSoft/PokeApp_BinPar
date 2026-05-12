# Arquitectura

Este documento profundiza en las decisiones de diseño que ya se resumen en el [README](../README.md). El objetivo es que cualquier persona del equipo pueda recoger este proyecto y entender no sólo **qué** hace, sino **por qué** está hecho así.

---

## Índice

1. [Visión de capas](#visión-de-capas)
2. [Capa de datos: PokéAPI](#capa-de-datos-pokéapi)
3. [Capa de estado: Zustand](#capa-de-estado-zustand)
4. [Capa de presentación: React + Next App Router](#capa-de-presentación-react--next-app-router)
5. [El reto de la cadena evolutiva](#el-reto-de-la-cadena-evolutiva)
6. [El reto de los 1025 Pokémon](#el-reto-de-los-1025-pokémon)
7. [Sistema de diseño y temas](#sistema-de-diseño-y-temas)
8. [Patrones aplicados](#patrones-aplicados)
9. [Trade-offs explícitos](#trade-offs-explícitos)

---

## Visión de capas

```
┌──────────────────────────────────────────────────────────────────────┐
│  components/  ←  presenta UI, no sabe nada de fetch                  │
├──────────────────────────────────────────────────────────────────────┤
│  hooks/       ←  orquesta SWR + store + lógica de filtrado/scroll    │
├──────────────────────────────────────────────────────────────────────┤
│  store/       ←  Zustand: filtros (memoria) y colección (persist)    │
├──────────────────────────────────────────────────────────────────────┤
│  lib/pokemon/ ←  ÚNICA puerta de salida a PokéAPI                    │
│                  ── api.ts ............ fetch + adaptadores          │
│                  ── generations.ts .... rangos por gen (estáticos)   │
│                  ── sprites.ts ........ URLs determinísticas         │
├──────────────────────────────────────────────────────────────────────┤
│  PokéAPI v2  (https://pokeapi.co)                                    │
└──────────────────────────────────────────────────────────────────────┘
```

**Reglas**:
- Una capa solo puede llamar a la inmediatamente inferior. Un componente no llama nunca a `fetch`.
- Los datos cruzan la frontera `lib → hooks` ya en su forma de dominio (`PokemonSummary`, `PokemonDetail`, `EvolutionNode`), no como respuestas raw.
- El store **no** sabe nada de la API; almacena solo estado de UI o estado derivado por el usuario (filtros, colección).

---

## Capa de datos: PokéAPI

### Adaptadores

`api.ts` define interfaces internas `RawPokemon`, `RawSpecies`, `RawChain`, etc., que reflejan **lo mínimo** que consumimos de la API. Esto:

- Documenta explícitamente qué dependencia tenemos.
- Acotamos el "blast radius" si la API cambia: solo se rompe `api.ts`.
- TypeScript nos chilla si la PokéAPI introduce un breaking change que tocamos.

Cada adaptador (`adaptSummary`, `adaptDetail`, `flattenChain`) es una **función pura**: in raw, out dominio. Esto hace que sean trivialmente testeables.

### Caché en dos niveles

| Nivel | Implementación | TTL |
|---|---|---|
| Servidor (RSC, build) | `fetch(url, { next: { revalidate: 86400 }})` — caché incorporada de Next | 24h |
| Cliente | SWR con key estable + `dedupingInterval: 60min` + `revalidateOnFocus: false` | 60min |

La estrategia es agresiva porque los datos de PokéAPI son **inmutables** salvo cuando Game Freak añade gens (un evento que ocurre cada ~3 años).

### URLs de sprites

PokéAPI devuelve URLs absolutas a su CDN (`raw.githubusercontent.com/PokeAPI/sprites/...`). Decidí **no** llamar a `/pokemon/{id}` solo para obtener una URL de sprite — la URL es **determinística** a partir del id. Tengo helpers `spritePixel(id)`, `spriteArtwork(id)` que construyen la URL directamente. Ahorra 1 llamada por sprite.

---

## Capa de estado: Zustand

### Por qué Zustand y no Context/Redux

- **Context**: cada actualización del `value` re-renderiza a TODOS los consumers. Para un store con muchos suscriptores (header, listado, vistas, controles), produciría re-renders en cascada.
- **Redux Toolkit**: maravilloso, pero abusivo para esta superficie. RTK Query duplicaría lo que ya hace SWR.
- **Zustand**: API minimalista (`create + useStore(selector)`), suscripción selectiva, middleware opt-in.

### Dos stores, no uno solo

Separo `filtersStore` y `pokedexStore` deliberadamente: tienen ciclo de vida diferente.

```ts
// filters.ts → memoria, "sesión de navegación"
export const useFiltersStore = create<FiltersState>(...)

// pokedex.ts → localStorage, "save game"
export const usePokedexStore = create<PokedexState>()(
  persist(..., { name: 'pokedex.collection.v1', version: 1 })
)
```

Esto cumple el requisito del enunciado:
> «Al volver desde una página de detalle al listado, deberá mantenerse el estado previo de la interfaz. **No es necesario mantener este estado tras recargar la página.**»

Si hubiera puesto la persistencia en `filtersStore`, los filtros también sobrevivirían al refresh, lo cual el enunciado **explícitamente no requiere** (y arguably, no quiere — un refresh debe darme una experiencia "fresca").

### Serialización del Set en `pokedexStore`

`Set<number>` es la estructura ideal para "colección":
- `has(id)` O(1)
- `add(id)`, `delete(id)` O(1)
- semánticamente claro

…pero JSON no admite Set. Por eso configuro `partialize` y `merge` en el middleware `persist`:

```ts
partialize: (state) => ({ owned: Array.from(state.owned) })
merge: (persisted, current) => ({ ...current, owned: new Set(persisted?.owned ?? []) })
```

La versión `v1` está en el nombre del store por si en el futuro cambio el esquema y quiero invalidar la cache de los usuarios existentes.

---

## Capa de presentación: React + Next App Router

### Server Components vs Client Components

| Componente | Tipo | Por qué |
|---|---|---|
| `app/layout.tsx`, `app/page.tsx`, `app/pokemon/[id]/page.tsx` | **Server** | Permiten primer paint estático con HTML completo. Mejor SEO, mejor LCP. |
| `PokemonDetailView` | **Server** | Resuelvo el detalle en el servidor con `fetchPokemonDetail`. Solo el botón "añadir a Pokédex" es cliente porque lee de localStorage. |
| `PokemonListing`, vistas, controles | **Client** | Consumen el store y/o reaccionan a interacción. |
| `EvolutionChain` | **Client** (`'use client'`) | Aunque renderiza una lista estática, contiene `<Link>` con `aria-current` y necesitará interacción en el futuro. |

### Por qué App Router (y no Pages)

- Server Components con `fetch` cacheable por defecto.
- `loading.tsx`, `error.tsx`, `not-found.tsx` adyacentes a la ruta.
- Metadata API por ruta, dinámica con `generateMetadata`.
- Mejor preparado para parallel routes y streaming.

---

## El reto de la cadena evolutiva

El requisito más interesante del enunciado: «buscar Pikachu también debe mostrar Pichu y Raichu».

### Opción descartada A: pedir la cadena evolutiva en cada keystroke

Requeriría 3+ llamadas por término (especies → chain → resolución de ids). Imposible cumplir "tiempo real".

### Opción descartada B: bundle estático precalculado

Funcionaría, pero rompe la regla "datos en tiempo real desde PokéAPI" del enunciado.

### Solución elegida: pre-cómputo del mapa de adyacencia al arrancar

1. Una sola llamada a `/evolution-chain?limit=600` devuelve **todas** las cadenas evolutivas.
2. Por cada cadena, aplanamos a un array de `speciesId`s.
3. Construimos un `Map<speciesId, speciesId[]>` donde cada miembro de una familia apunta al mismo array.
4. SWR lo cachea — esta operación pasa **una sola vez por sesión**.

En el filtro de búsqueda (`useFilteredPokemon`), cuando hay un término:
- Encontramos directos por subcadena.
- Para cada directo, unimos su familia (`adjacency.get(speciesId)`) al conjunto a revelar.
- El render final filtra por (es directo) OR (pertenece a una familia con un directo).

Resultado: **búsqueda < 5ms** sobre 1025 entradas.

### Cómo aplanamos el árbol

La PokéAPI devuelve el árbol como nested:

```
chain
├── species: pichu
└── evolves_to[0]
    ├── species: pikachu
    └── evolves_to[0]
        └── species: raichu
```

`flattenChain` hace DFS asignando `stage = 0/1/2…` según profundidad. Para casos ramificados (Eevee → 8 evoluciones), todas comparten `stage = 1`. La vista las renderiza apiladas en una "columna".

---

## El reto de los 1025 Pokémon

Necesitamos `types[]` y `generation` para filtrar. **Sin** estos campos no podemos cumplir el enunciado.

### Aproximación naïve

```ts
// 1025 requests. Terrible.
const all = await Promise.all(
  ids.map(id => fetch(`/pokemon/${id}`))
);
```

Time-to-list (TTL) > 30s. Inaceptable.

### Aproximación elegida

```ts
// 1 llamada por tipo × 18 tipos = 18 requests, paralelas.
const typesById = new Map<number, PokemonTypeName[]>();
await Promise.all(
  TYPE_NAMES.map(async (typeName) => {
    const data = await api(`/type/${typeName}`);
    for (const entry of data.pokemon) {
      const id = idFromUrl(entry.pokemon.url);
      // ... acumular en typesById
    }
  })
);
// + 1 llamada para los nombres oficiales
const list = await api(`/pokemon?limit=1025`);
```

TTL ≈ 1.5-2s en una conexión normal. La PokéAPI sirve esos endpoints en milisegundos.

### La generación, sin llamada extra

```ts
export const GENERATIONS = [
  { id: 1, range: [1, 151], region: 'Kanto' },
  { id: 2, range: [152, 251], region: 'Johto' },
  // ...
];

export function getGenerationIdForPokemon(id: number): GenerationId {
  return GENERATIONS.find(g => id >= g.range[0] && id <= g.range[1])?.id ?? 1;
}
```

Los rangos son fijos por convención. Hard-codearlos elimina ~9 llamadas extra a `/generation/{id}`.

---

## Sistema de diseño y temas

### Tokens

Definidos en `tailwind.config.ts`:

- **`ink`** — escala de grises fríos para fondos, bordes, textos secundarios.
- **`flame`** — naranja brasa, color de marca primario.
- **`electric`**, **`leaf`**, **`water`** — acentos para estados (warning, success, info).
- **`type`** — 18 colores canónicos de tipos Pokémon, paleta oficial.

En `globals.css` además declaro variables `--accent` y `--accent-soft` para gradientes dinámicos.

### Componentes utility (`@layer components`)

- `.panel`, `.panel-strong` — paneles con cristal/blur.
- `.chip`, `.chip-active` — chips de filtros y tipos.
- `.btn`, `.btn-primary`, `.btn-ghost` — botones.
- `.led`, `.scanline`, `.display` — adornos del look "Pokédex".

Estos componentes evitan repetir tailwind verboso a lo largo del código.

### Animaciones

- `pulse-slow` — skeletons.
- `scan` — la línea translúcida que recorre las imágenes (`scanline::after`).
- `pop` — entrada de cards.

Todas se desactivan con `prefers-reduced-motion: reduce`.

---

## Patrones aplicados

- **Adapter** — `lib/pokemon/api.ts` traduce contratos PokéAPI → modelos de dominio.
- **Facade / Repository** — los hooks (`useAllPokemon`, `usePokemonDetail`) son la única forma en que la UI accede a datos.
- **State Container** — Zustand stores como single source of truth de UI/colección.
- **Container / Presentational** — `PokemonListing` orquesta, las `*View` solo presentan.
- **Hook composition** — `useFilteredPokemon` compone `useAllPokemon` + `useEvolutionAdjacency` + `useDebounce` + `useFiltersStore`.
- **Lazy / Incremental rendering** — `IntersectionObserver` para paginar el listado.
- **Defensive normalization** — `idFromUrl`, `pickFlavorText` con fallback a inglés, `try/catch` en cadenas evolutivas rotas.

---

## Tematización: dark/light sin duplicar clases

### El problema

Tailwind tiene un modo `dark:` que prefijaría todas las clases (`bg-white dark:bg-ink-900`). Para una app con la cantidad de utilidades que ésta tiene, supone duplicar literalmente cientos de clases.

### La solución

Definimos la paleta `ink-*` como **variables CSS** que cambian de valor según `[data-theme]`:

```css
:root                       { --ink-900: 8 7 10; --overlay: 255 255 255; }
:root[data-theme='light']   { --ink-900: 247 246 242; --overlay: 30 28 22; }
```

En `tailwind.config.ts` cada token resuelve a `rgb(var(--ink-X) / <alpha-value>)`, así seguimos pudiendo escribir `bg-ink-900/60` y la alpha se aplica.

Resultado: **el código de componentes no sabe que hay dos temas**. Sólo escribimos `bg-ink-900` y "dependiendo del atributo en `<html>`, eso es un color u otro".

El token adicional `overlay` reemplaza los antiguos `white/N` (velos translúcidos sobre fondos oscuros). En modo claro, `overlay` se convierte en negro semi-transparente — el mismo "velo" pero con la inclinación correcta.

### Script anti-flash

El store de tema vive en `localStorage`, pero Zustand no lo lee hasta DESPUÉS del primer paint. Sin precaución, los usuarios con tema claro ven un parpadeo oscuro de ~100 ms.

Inyectamos un IIFE minificado en `<head>` (en `layout.tsx`):

```js
(function(){try{
  var t=JSON.parse(localStorage.getItem('pokedex.theme.v1')||'null');
  var theme=(t&&t.state&&t.state.theme)||'dark';
  document.documentElement.dataset.theme=theme;
}catch(e){}})();
```

Es lo primero que ejecuta el navegador, antes de descargar React. Las cadenas mágicas (`pokedex.theme.v1`) deben coincidir con `name` en el store de Zustand; lo documentamos en el comentario del script.

## i18n: sin librerías, tipado fuerte

### Por qué no `next-intl`

`next-intl` es excelente pero su valor brilla con: rutas localizadas (`/es/...`, `/en/...`), pluralización ICU, formateo de fechas/números por locale. Nuestro caso tiene ~100 cadenas estáticas, 2 idiomas y cero rutas localizadas. Una librería externa cuesta ~30 KB minified + configuración no trivial.

### La implementación

Tres ficheros:

1. **`dictionaries.ts`** — un objeto plano por idioma. Claves dot-separadas (`detail.evolution.heading`). El diccionario `es` se declara `as const` y sus claves se derivan vía `keyof typeof es` — eso le da a `en` un `Record<DictKey, string>` que TypeScript verifica.
2. **`useT.ts`** — hook que lee el locale del store de Zustand y devuelve `(key, vars?) => string`. Interpolación con regex `{placeholder}`.
3. **`store/locale.ts`** — Zustand con persist, igual que el store de tema.

### Interacción con Server Components

Los componentes que renderizan texto traducible son **Client Components**, pero los datos del Pokémon (en la página de detalle) se siguen resolviendo en servidor. El patrón:

```tsx
// Server Component
export default async function Page({ params }) {
  const pokemon = await fetchPokemonDetail(params.id);   // SSR fetch
  return <PokemonDetailView pokemon={pokemon} />;        // Client view
}

// 'use client'
export function PokemonDetailView({ pokemon }) {
  const t = useT();
  return <h1>{t('detail.evolution.heading')}</h1>;
}
```

Best of both worlds: SSR del fetch + reactividad del idioma sin recargar.

## Trade-offs explícitos

| Decisión | Trade-off |
|---|---|
| 18 fetches iniciales por tipo en vez de un bundle estático | Datos siempre frescos vs. ~1.5s de carga inicial. Optimización futura: precalcular en build con `force-static`. |
| `<img>` directo en vez de `next/image` | Pierdo optimizaciones de Next (AVIF, sizing). Gano simplicidad y no impongo coste de optimizer sobre un CDN ya optimizado. |
| Paginación incremental sin virtualización real | 1025 nodos en DOM en el peor caso. He medido y FPS sigue >60 incluso en hardware modesto. Si la lista crece (filtros más permisivos, futuras gens) migraría a `@tanstack/react-virtual`. |
| Sin tests automatizados | Por tiempo. La capa más crítica (`useFilteredPokemon`, adaptadores) está aislada y testearla sería trivial. |
| Zustand persist en la colección, no en filtros | Cumple **exactamente** el requisito del enunciado. |
| Búsqueda case-insensitive con `String.includes` | Match O(n×m) por palabra. Para 1025 items × ~10 chars promedio es instantáneo. Para datasets mayores, trigram index. |
| Sin librería de icons | 4 SVGs inline. Ahorro de bundle, control total del look. |
| App Router en vez de Pages | Beneficios > coste de aprendizaje (RSC, streaming, file-based loading/error). |
