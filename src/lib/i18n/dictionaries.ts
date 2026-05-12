/**
 * Diccionarios de traducción.
 *
 * Estructura aplanada por convención: claves estilo `seccion.subseccion.elemento`.
 * Las funciones de pluralización las dejamos como tres claves separadas
 * (`results.one`, `results.other`) y las elige el caller — es más simple que
 * arrastrar ICU MessageFormat para 4 cadenas.
 *
 * Para mantener seguridad de tipos: `Dict` se infiere del diccionario `es`
 * (la fuente de verdad) y `en` debe tener exactamente las mismas claves.
 */

export const es = {
  // ── Header ─────────────────────────────────────────────────────────────────
  'nav.game': '¿Quién es ese Pokémon?',
  'header.language': 'Idioma',
  'header.theme': 'Tema',
  'header.theme_switch_to_light': 'Cambiar a modo claro',
  'header.theme_switch_to_dark': 'Cambiar a modo oscuro',

  // ── Footer ─────────────────────────────────────────────────────────────────
  'footer.built_with': 'Construido con Next.js · TypeScript · Datos cortesía de',
  'footer.binpar': 'Prueba técnica para BinPar',
  'footer.author': 'Desarrollado por',
  'footer.disclaimer': 'No afiliado oficialmente con Nintendo / Game Freak.',

  // ── Home — Hero ────────────────────────────────────────────────────────────
  'home.hero.subtitle':
    'Datos en tiempo real desde la PokéAPI. Busca por nombre o número, filtra por múltiples tipos y generaciones, y marca tus Pokémon capturados en el modo Pokédex.',

  // ── Controles ──────────────────────────────────────────────────────────────
  'search.placeholder': 'Buscar Pokémon…',
  'search.aria_label': 'Buscar Pokémon por nombre o número',
  'search.clear': 'Limpiar búsqueda',
  'filter.type.label': 'Tipo',
  'filter.type.aria': 'Filtrar por tipo',
  'filter.generation.label': 'Generación',
  'filter.generation.aria': 'Filtrar por generación',
  'filter.all': 'Todos',
  'filter.all_fem': 'Todas',
  'filter.active': 'Filtros activos:',
  'filter.clear_all': 'Limpiar todo',
  'filter.gen_short': 'Gen',
  'filter.collapse': 'Contraer',
  'filter.expand': 'Expandir',
  'filter.panel.hide': 'Ocultar filtros',
  'filter.panel.show': 'Mostrar filtros',
  'filter.selected_count': '{count} seleccionado',
  'filter.selected_count_plural': '{count} seleccionados',
  'viewmode.aria': 'Modo de visualización',
  'viewmode.cards': 'Cards',
  'viewmode.table': 'Tabla',
  'viewmode.pokedex': 'Pokédex',

  // ── Listado ────────────────────────────────────────────────────────────────
  'list.results': 'resultados',
  'list.showing': 'mostrando',
  'list.loading_more': 'Cargando más…',
  'list.empty.title': 'Sin resultados',
  'list.empty.body': 'Prueba a relajar algún filtro o usa otro término de búsqueda.',
  'list.error.title': 'No hemos podido cargar la Pokédex.',

  // ── Vista Pokédex (colección) ──────────────────────────────────────────────
  'pokedex.tab.all': 'Todos',
  'pokedex.tab.owned': 'Capturados',
  'pokedex.tab.missing': 'Pendientes',
  'pokedex.help': 'Toca una ficha para marcar/desmarcar. Mantenemos tu progreso en este dispositivo.',
  'pokedex.empty.filtered': 'No hay Pokémon que mostrar con los filtros actuales.',
  'pokedex.stats.status': 'Estado de la Pokédex',
  'pokedex.stats.caught_of': 'capturados',
  'pokedex.stats.completed': 'completado',
  'pokedex.stats.dominant_type': 'Tu tipo dominante:',
  'pokedex.stats.first_marks': 'Marca tus primeros Pokémon para ver tus tipos favoritos.',
  'pokedex.stats.types_dist': 'Distribución por tipo',
  'pokedex.stats.reset': 'Reiniciar colección',
  'pokedex.stats.reset_confirm': '¿Vaciar tu colección? Esta acción no se puede deshacer.',
  'pokedex.entry.toggle_add': 'Marcar {name} como capturado',
  'pokedex.entry.toggle_remove': 'Desmarcar {name} de la colección',
  'pokedex.entry.view_detail': 'Ver detalle',

  // ── Detalle ────────────────────────────────────────────────────────────────
  'detail.back': 'Volver al listado',
  'detail.height': 'Altura',
  'detail.weight': 'Peso',
  'detail.base_exp': 'Exp. base',
  'detail.total_stats': 'Total stats',
  'detail.stats.heading': 'Estadísticas base',
  'detail.stats.hp': 'HP',
  'detail.stats.attack': 'Ataque',
  'detail.stats.defense': 'Defensa',
  'detail.stats.sp_attack': 'Atq. Esp.',
  'detail.stats.sp_defense': 'Def. Esp.',
  'detail.stats.speed': 'Velocidad',
  'detail.abilities.heading': 'Habilidades',
  'detail.abilities.hidden': 'Oculta',
  'detail.moves.heading': 'Movimientos iniciales',
  'detail.moves.level_prefix': 'Nv.',
  'detail.moves.empty': 'No tiene movimientos por nivel registrados.',
  'detail.evolution.heading': 'Línea evolutiva',
  'detail.evolution.none': 'Este Pokémon no tiene una cadena evolutiva conocida.',
  'detail.evolution.here': 'aquí',
  'detail.toggle.add': 'Añadir a la Pokédex',
  'detail.toggle.remove': 'En tu Pokédex',

  // ── Páginas auxiliares ─────────────────────────────────────────────────────
  'notfound.title': 'Pokémon no encontrado',
  'notfound.body': 'Quizás todavía no existe… o se ha escapado por la hierba alta.',
  'notfound.cta': 'Volver a la Pokédex',
  'error.title': 'Algo ha fallado en la Pokédex',
  'error.retry': 'Reintentar',

  // ── Tipos ──────────────────────────────────────────────────────────────────
  'type.normal': 'Normal',
  'type.fire': 'Fuego',
  'type.water': 'Agua',
  'type.electric': 'Eléctrico',
  'type.grass': 'Planta',
  'type.ice': 'Hielo',
  'type.fighting': 'Lucha',
  'type.poison': 'Veneno',
  'type.ground': 'Tierra',
  'type.flying': 'Volador',
  'type.psychic': 'Psíquico',
  'type.bug': 'Bicho',
  'type.rock': 'Roca',
  'type.ghost': 'Fantasma',
  'type.dragon': 'Dragón',
  'type.dark': 'Siniestro',
  'type.steel': 'Acero',
  'type.fairy': 'Hada',

  // ── Trigger evolutivos ─────────────────────────────────────────────────────
  'trigger.level': 'Nivel {n}',
  'trigger.happiness': 'Alta amistad',
  'trigger.affection': 'Alto afecto',
  'trigger.trade': 'Intercambio',
  'trigger.special': 'Caso especial',

  // ── Comparador ─────────────────────────────────────────────────────────────
  'compare.title': 'Comparativa de stats',
  'compare.subtitle': 'Compara las estadísticas base de tus Pokémon favoritos.',
  'compare.swap': 'Intercambiar',
  'compare.add': 'Añadir Pokémon',
  'compare.empty.cta': 'Elegir Pokémon',
  'compare.empty.hint': 'Pulsa para buscar y seleccionar.',
  'compare.search.placeholder': 'Buscar por nombre o número…',
  'compare.search.no_results': 'Sin resultados',
  'compare.remove': 'Quitar de la comparativa',
  'compare.change': 'Cambiar',
  'compare.vs': 'vs',
  'compare.stats.heading': 'Estadísticas base',
  'compare.summary.heading': 'Resumen',
  'compare.summary.help': 'Compara el rendimiento general de cada Pokémon.',
  'compare.summary.total': 'Total stats',
  'compare.summary.total_max': '/600',
  'compare.pick_both': 'Elige dos Pokémon para empezar la comparativa.',
  'nav.compare': 'Comparativa',
  'header.random_aria': 'Saltar a un Pokémon aleatorio',

  // ── Mini-juego: ¿Quién es ese Pokémon? ────────────────────────────────────
  'game.title': '¿Quién es ese Pokémon?',
  'game.subtitle':
    'Adivina el Pokémon antes de que se acabe el tiempo. Aciertos consecutivos = racha. Si lo aciertas y aún no estaba en tu Pokédex, lo añadimos.',
  'game.streak.current': 'Racha',
  'game.streak.best': 'Mejor',
  'game.input.placeholder': 'Escribe el nombre…',
  'game.input.aria': 'Escribe el nombre del Pokémon',
  'game.submit': 'Adivinar',
  'game.time_left': '{n}s',
  'game.reveal.correct': '¡Es {name}!',
  'game.reveal.failed': '¡Era {name}!',
  'game.captured_now': '+1 en tu Pokédex',
  'game.next': 'Siguiente',
  'game.give_up': 'Rendirse',
  'game.view_detail': 'Ver ficha completa',
  'game.loading': 'Cargando Pokémon…',
  'game.hint': 'Acentos y mayúsculas no importan.',
  // Modos
  'game.mode.label': 'Modo de juego',
  'game.mode.easy': 'Fácil',
  'game.mode.easy.caption': '20 s · sólo 1ª generación',
  'game.mode.normal': 'Normal',
  'game.mode.normal.caption': '15 s · tus filtros',
  'game.mode.hard': 'Difícil',
  'game.mode.hard.caption': '10 s · totalmente aleatorio',
  'game.mode.pick_prompt': 'Elige un modo para empezar.',
  'game.mode.pool_empty': 'Ningún Pokémon coincide con los filtros. Cambia los filtros o prueba otro modo.',
  'game.mode.filters_heading': 'Filtros activos para el modo Normal',
} as const;

export type DictKey = keyof typeof es;

export const en: Record<DictKey, string> = {
  // Header
  'nav.game': "Who's That Pokémon?",
  'header.language': 'Language',
  'header.theme': 'Theme',
  'header.theme_switch_to_light': 'Switch to light mode',
  'header.theme_switch_to_dark': 'Switch to dark mode',

  // Footer
  'footer.built_with': 'Built with Next.js · TypeScript · Data courtesy of',
  'footer.binpar': 'Technical assignment for BinPar',
  'footer.author': 'Built by',
  'footer.disclaimer': 'Not officially affiliated with Nintendo / Game Freak.',

  // Home — Hero
  'home.hero.subtitle':
    'Real-time data from PokéAPI. Search by name or number, filter by multiple types and generations, and mark caught Pokémon in Pokédex mode.',

  // Controles
  'search.placeholder': 'Search Pokémon…',
  'search.aria_label': 'Search Pokémon by name or number',
  'search.clear': 'Clear search',
  'filter.type.label': 'Type',
  'filter.type.aria': 'Filter by type',
  'filter.generation.label': 'Generation',
  'filter.generation.aria': 'Filter by generation',
  'filter.all': 'All',
  'filter.all_fem': 'All',
  'filter.active': 'Active filters:',
  'filter.clear_all': 'Clear all',
  'filter.gen_short': 'Gen',
  'filter.collapse': 'Collapse',
  'filter.expand': 'Expand',
  'filter.panel.hide': 'Hide filters',
  'filter.panel.show': 'Show filters',
  'filter.selected_count': '{count} selected',
  'filter.selected_count_plural': '{count} selected',
  'viewmode.aria': 'View mode',
  'viewmode.cards': 'Cards',
  'viewmode.table': 'Table',
  'viewmode.pokedex': 'Pokédex',

  // Listado
  'list.results': 'results',
  'list.showing': 'showing',
  'list.loading_more': 'Loading more…',
  'list.empty.title': 'No matches',
  'list.empty.body': 'Try relaxing a filter or using a different search term.',
  'list.error.title': 'We could not load the Pokédex.',

  // Vista Pokédex
  'pokedex.tab.all': 'All',
  'pokedex.tab.owned': 'Caught',
  'pokedex.tab.missing': 'Missing',
  'pokedex.help': 'Tap an entry to mark/unmark. We keep your progress on this device.',
  'pokedex.empty.filtered': 'No Pokémon match the current filters.',
  'pokedex.stats.status': 'Pokédex status',
  'pokedex.stats.caught_of': 'caught',
  'pokedex.stats.completed': 'completed',
  'pokedex.stats.dominant_type': 'Your top type:',
  'pokedex.stats.first_marks': 'Mark your first Pokémon to see your favourite types.',
  'pokedex.stats.types_dist': 'Type distribution',
  'pokedex.stats.reset': 'Reset collection',
  'pokedex.stats.reset_confirm': 'Empty your collection? This cannot be undone.',
  'pokedex.entry.toggle_add': 'Mark {name} as caught',
  'pokedex.entry.toggle_remove': 'Remove {name} from your collection',
  'pokedex.entry.view_detail': 'View detail',

  // Detalle
  'detail.back': 'Back to the list',
  'detail.height': 'Height',
  'detail.weight': 'Weight',
  'detail.base_exp': 'Base exp.',
  'detail.total_stats': 'Total stats',
  'detail.stats.heading': 'Base stats',
  'detail.stats.hp': 'HP',
  'detail.stats.attack': 'Attack',
  'detail.stats.defense': 'Defense',
  'detail.stats.sp_attack': 'Sp. Atk',
  'detail.stats.sp_defense': 'Sp. Def',
  'detail.stats.speed': 'Speed',
  'detail.abilities.heading': 'Abilities',
  'detail.abilities.hidden': 'Hidden',
  'detail.moves.heading': 'Initial moves',
  'detail.moves.level_prefix': 'Lv.',
  'detail.moves.empty': 'No level-up moves recorded.',
  'detail.evolution.heading': 'Evolution line',
  'detail.evolution.none': 'This Pokémon has no known evolution chain.',
  'detail.evolution.here': 'here',
  'detail.toggle.add': 'Add to Pokédex',
  'detail.toggle.remove': 'In your Pokédex',

  // Auxiliares
  'notfound.title': 'Pokémon not found',
  'notfound.body': 'Maybe it does not exist yet… or it ran away in the tall grass.',
  'notfound.cta': 'Back to the Pokédex',
  'error.title': 'Something went wrong in the Pokédex',
  'error.retry': 'Retry',

  // Tipos
  'type.normal': 'Normal',
  'type.fire': 'Fire',
  'type.water': 'Water',
  'type.electric': 'Electric',
  'type.grass': 'Grass',
  'type.ice': 'Ice',
  'type.fighting': 'Fighting',
  'type.poison': 'Poison',
  'type.ground': 'Ground',
  'type.flying': 'Flying',
  'type.psychic': 'Psychic',
  'type.bug': 'Bug',
  'type.rock': 'Rock',
  'type.ghost': 'Ghost',
  'type.dragon': 'Dragon',
  'type.dark': 'Dark',
  'type.steel': 'Steel',
  'type.fairy': 'Fairy',

  // Triggers evolutivos
  'trigger.level': 'Level {n}',
  'trigger.happiness': 'High friendship',
  'trigger.affection': 'High affection',
  'trigger.trade': 'Trade',
  'trigger.special': 'Special case',

  // Comparator
  'compare.title': 'Stat comparison',
  'compare.subtitle': 'Compare the base stats of your favourite Pokémon.',
  'compare.swap': 'Swap',
  'compare.add': 'Add Pokémon',
  'compare.empty.cta': 'Pick a Pokémon',
  'compare.empty.hint': 'Tap to search and select.',
  'compare.search.placeholder': 'Search by name or number…',
  'compare.search.no_results': 'No matches',
  'compare.remove': 'Remove from comparison',
  'compare.change': 'Change',
  'compare.vs': 'vs',
  'compare.stats.heading': 'Base stats',
  'compare.summary.heading': 'Summary',
  'compare.summary.help': 'Compare overall performance for each Pokémon.',
  'compare.summary.total': 'Total stats',
  'compare.summary.total_max': '/600',
  'compare.pick_both': 'Pick two Pokémon to start the comparison.',
  'nav.compare': 'Compare',
  'header.random_aria': 'Jump to a random Pokémon',

  // Mini-game: Who's That Pokémon?
  'game.title': "Who's That Pokémon?",
  'game.subtitle':
    'Guess the Pokémon before time runs out. Consecutive hits = streak. If you nail it and it was missing from your Pokédex, we add it for you.',
  'game.streak.current': 'Streak',
  'game.streak.best': 'Best',
  'game.input.placeholder': 'Type the name…',
  'game.input.aria': "Type the Pokémon's name",
  'game.submit': 'Guess',
  'game.time_left': '{n}s',
  'game.reveal.correct': "It's {name}!",
  'game.reveal.failed': 'It was {name}!',
  'game.captured_now': '+1 in your Pokédex',
  'game.next': 'Next',
  'game.give_up': 'Give up',
  'game.view_detail': 'Open full entry',
  'game.loading': 'Loading Pokémon…',
  'game.hint': 'Accents and case don’t matter.',
  // Modes
  'game.mode.label': 'Game mode',
  'game.mode.easy': 'Easy',
  'game.mode.easy.caption': '20 s · gen 1 only',
  'game.mode.normal': 'Normal',
  'game.mode.normal.caption': '15 s · your filters',
  'game.mode.hard': 'Hard',
  'game.mode.hard.caption': '10 s · fully random',
  'game.mode.pick_prompt': 'Pick a mode to start.',
  'game.mode.pool_empty': 'No Pokémon match these filters. Change them or try another mode.',
  'game.mode.filters_heading': 'Active filters for Normal mode',
};

export type Locale = 'es' | 'en';

export const DICTIONARIES: Record<Locale, Record<DictKey, string>> = {
  es,
  en,
};
