/**
 * Declaraciones globales de TypeScript.
 *
 * Next.js ya inyecta declaraciones para imports de CSS a través de `next-env.d.ts`
 * (que referencia los tipos del paquete `next`), pero algunos Language Servers
 * de IDE (versiones recientes de TS, o cuando la cache se ensucia) no resuelven
 * correctamente esas declaraciones y marcan errores como:
 *
 *   TS2882: No se pueden encontrar declaraciones de módulo para './globals.css'
 *
 * Esta declaración explícita garantiza que ese error desaparezca sin depender
 * de la propagación de tipos de Next. Es un fallback seguro: si Next también
 * declara `*.css`, las dos declaraciones se fusionan sin conflicto (ambas
 * dicen lo mismo).
 *
 * Cubre tres casos:
 *   - `import './foo.css'`          — efecto lateral (estilos globales)
 *   - `import styles from './a.module.css'` — CSS modules con clases tipadas
 *   - `import './foo.scss'`         — por si en el futuro añadimos Sass
 */

declare module '*.css' {
  const content: { readonly [className: string]: string };
  export default content;
}

declare module '*.module.css' {
  const classes: { readonly [className: string]: string };
  export default classes;
}

declare module '*.scss' {
  const content: { readonly [className: string]: string };
  export default content;
}
