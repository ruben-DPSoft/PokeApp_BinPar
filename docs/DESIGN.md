# Sistema de diseño

Documento de referencia rápida sobre la identidad visual del proyecto. Pensado para que cualquier persona pueda **retocar** la paleta, los componentes o los detalles sin tener que ingeniería-inversar el CSS.

---

## Sistema de tema (claro / oscuro)

La paleta se define mediante **variables CSS** en `globals.css`. Los tokens `ink-*` y `overlay` resuelven a valores diferentes según el atributo `[data-theme]` en `<html>`:

| Token | Dark | Light | Uso semántico |
|---|---|---|---|
| `ink-900` | `#08070a` | `#f7f6f2` | Canvas (fondo de página) |
| `ink-700` | `#1b1a14` | `#ffffff` | Paneles destacados |
| `ink-100` | `#ecebe4` | `#1b1a14` | Texto primario |
| `ink-50`  | `#f7f6f2` | `#08070a` | Texto fuerte / titulares |
| `ink-300` | `#a8a594` | `#5c594c` | Texto secundario / metadata |
| `overlay` | `#ffffff` | `#1e1c16` | Velos translúcidos (bordes, hovers) |

Las clases del código siempre escriben `bg-ink-900`, `text-ink-100`, `border-overlay/10`, etc. Cambiar de tema sólo cambia el atributo `data-theme` en `<html>` — no se re-renderiza React.

## Paleta de marca (igual en ambos temas)

| Token | HEX | Uso |
|---|---|---|
| **`flame-500`** | `#ed4a08` | **Color de marca.** CTAs, highlights, "aquí" en evolución. Igual en ambos temas. |
| `flame-400` | `#ff6a26` | Hover de CTAs. |
| `flame-300` | `#ff9457` | Texto secundario sobre fondos oscuros (links). |
| `electric-400` | `#ffd23f` | Acento amarillo (stats medias). |
| `leaf-400` | `#5fc46a` | LED activo, stats altas. |
| `water-400` | `#3aa6ff` | Reservado, no se usa todavía. |
| `type-{normal,fire,water,...}` | colores canónicos oficiales | Badges de tipo. |

### Gradientes

- **Fondo global**: dos radial-gradients en esquinas opuestas + gradiente vertical inferior.
- **Cards**: radial-gradient derivado del/los tipos del Pokémon (`primary` arriba-derecha + `secondary` abajo-izquierda).
- **Hero del detalle**: igual que cards pero más intenso y de mayor radio.

---

## Tipografía

| Rol | Variable | Stack |
|---|---|---|
| Display (`display` class) | `--font-display` | Space Grotesk → Inter → system-ui |
| Body | `--font-body` | Inter → system-ui |
| Mono (`font-mono`) | nativa | SF Mono → ui-monospace |

> En esta iteración no descargo Space Grotesk para no añadir peso de fuentes; el sistema cae al primer disponible. Si se desea forzarla, basta con un `next/font/google` en `layout.tsx`.

### Escala

- Hero `text-5xl`/`6xl` (display)
- H2 `text-xl` font-bold
- Body `text-sm`/`text-base`
- Metadata `text-xs`, `uppercase`, `tracking-[0.18em]`
- Mono Dex `font-mono text-xs/sm`

---

## Componentes utility (`@layer components`)

```css
.panel              /* card básico con cristal y borde sutil */
.panel-strong       /* card destacado con blur y sombra */
.chip               /* píldora neutra */
.chip-interactive   /* chip clickable */
.chip-active        /* chip seleccionado */
.btn                /* botón base */
.btn-primary        /* botón flame */
.btn-ghost          /* botón outline ligero */
.led                /* círculo con glow (decorativo) */
.display            /* aplica font-display + tracking-tight */
.scanline           /* contenedor + ::after con animación scan */
```

---

## Detalles distintivos

Estos son los "guiños" que diferencian la app de cualquier Pokédex genérica:

1. **Marca de agua del número Dex** detrás de cards y hero del detalle. Tipografía display, opacidad 4-6%, sin pointer-events. Refuerza la lectura del número grande de un vistazo.
2. **Scanline** translúcida que recorre verticalmente las imágenes de los Pokémon. Animación CSS pura (no JS). Cita visual al hardware Pokédex retro.
3. **LEDs** (puntos de 10px con `box-shadow: 0 0 8px currentColor`) en:
   - El switch de modo Pokédex (color `leaf-400` cuando activo).
   - El panel `PokedexStats` ("ESTADO DE LA PÓKEDEX").
4. **Botón de marca Pokédex en el header** — círculos concéntricos rojos/blancos imitando una Pokéball estilizada.
5. **Siluetas** en el modo Pokédex: los Pokémon no capturados aparecen con `filter: brightness(0) invert(0.06)`. Al marcarlos, recuperan color y aparecen sus tipos (refuerzo positivo).
6. **Badges de tipo** con su color canónico oficial + sombra interna + LED blanco a la izquierda. Más vivos que la mayoría de implementaciones.

---

## Responsive — breakpoints utilizados

| Token Tailwind | px | Notas |
|---|---|---|
| `sm` | 640 | móvil grande → tablet portrait |
| `md` | 768 | tablet portrait → tablet landscape |
| `lg` | 1024 | tablet landscape → desktop |
| `xl` | 1280 | desktop ancho |

### Grids del listado

| Vista | <640 | 640-1024 | 1024-1280 | ≥1280 |
|---|---|---|---|---|
| Cards | 2 | 3 | 4 | 5 |
| Tabla | 2 cols (sprite + datos apilados) | 5 cols completas | igual | igual |
| Pokédex | 3 | 4-5 | 6 | 8 |

---

## Animaciones

```ts
'pulse-slow': 4s,    // skeletons
'scan': 3.5s lineal, // scanline sobre sprites
'pop': 0.25s ease,   // entrada de elementos
```

Todas se desactivan vía `@media (prefers-reduced-motion: reduce)` en `globals.css`.

---

## Cómo cambiar la paleta

1. Edita los valores de las variables CSS en `globals.css`:
   - `:root` para el modo oscuro.
   - `:root[data-theme='light']` para el modo claro.
2. Si la nueva paleta requiere refrescar gradientes, actualiza también:
   - `body { background-image: ... }` con las variables `--bg-radial-N`.
   - Variables `--accent`, `--accent-soft`.
3. Si añades colores nuevos no presentes en `ink-*`, decláralos en `tailwind.config.ts` → `theme.extend.colors`.
4. Actualiza `lib/utils.ts` → `TYPE_COLOR` si tocaste alguno de tipos.

No hay duplicación de hex codes fuera de esos sitios — `tailwind.config.ts` referencia las variables, los componentes referencian los tokens de Tailwind.

## Cómo añadir un idioma

1. Edita `src/lib/i18n/dictionaries.ts` y añade una nueva entrada al objeto exportado `DICTIONARIES` con la misma forma que `es` o `en`. TypeScript verificará que tienes todas las claves.
2. Amplía el tipo `Locale` en el mismo archivo: `export type Locale = 'es' | 'en' | 'fr';`.
3. Actualiza `LanguageToggle.tsx` para incluir el nuevo botón (o convierte el toggle binario en un dropdown de 3+ idiomas).

El resto del código consume `useT()` y se actualiza automáticamente.
