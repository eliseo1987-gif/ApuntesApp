# Diseño de Personalización Granular del Tema (Scientific Luxury)

## Visión General

El objetivo es permitir a los alumnos personalizar completamente la interfaz gráfica de la aplicación "ApuntesApp" escogiendo colores principales, colores de fondo y tipografía. Todo se aplicará de forma global en tiempo real utilizando variables CSS y el estado global de la aplicación.

## Arquitectura y Almacenamiento

- **Base de Datos (IndexedDB / Estado Local)**: Se extenderá `lib/store.ts` para almacenar un objeto `theme_preferences` que contenga:
  - `primaryColor` (hexadecimal para botones, íconos y acentos).
  - `backgroundColor` (hexadecimal para el fondo principal de la app).
  - `fontFamily` (cadena de texto con el nombre de la tipografía elegida).
- **Proveedor de Tema (ThemeProvider)**: Un nuevo componente React envolverá la aplicación en el layout principal. Este leerá `theme_preferences` de forma asíncrona al cargar y actualizará variables CSS en `:root` (ej. `--color-primary`, `--color-background`, `--font-sans`).
- **Tipografías Premium**: Se integrarán fuentes de Google Fonts (Inter, Montserrat, Outfit, Merriweather) en la cabecera de la aplicación o a través del archivo de estilos global.

## Interfaz de Usuario en Configuración (Settings)

Se añadirá una sección de "Personalización Visual" en la página `app/settings/page.tsx` con el siguiente contenido:

1. **Color Principal (Acentos)**
   - Paleta rápida de 8 colores vibrantes predefinidos (Estilo Scientific Luxury).
   - Un selector de color libre `<input type="color">` para que el alumno escoja tonos exactos.

2. **Color de Fondo**
   - Selector similar al anterior para definir el fondo. (Se puede incluir un botón de modo oscuro nativo como extra, o simplemente dejar que el usuario elija un tono muy oscuro).

3. **Selector de Tipografía**
   - Menú desplegable o lista de opciones. Cada opción renderizará su nombre utilizando su respectiva tipografía a modo de previsualización (ej. la opción "Outfit" se muestra escrita con la fuente Outfit).

4. **Botón de Restablecimiento**
   - Un botón para volver a los valores predeterminados (Fondo blanco/claro, color principal Índigo, tipografía Inter).

## Integración con Tailwind CSS

- Para que los colores personalizados funcionen sin romper la estructura de Tailwind, se configurarán variables CSS en `tailwind.config.ts` o `globals.css` (ej. mapear `bg-primary` a `var(--color-primary)`), en lugar de usar las clases de color fijas (como `bg-indigo-600`).
- Se debe revisar y reemplazar progresivamente las clases duras en los componentes principales (como botones activos, fondos de contenedores o iconos) por las nuevas clases dinámicas de Tailwind impulsadas por variables CSS.
