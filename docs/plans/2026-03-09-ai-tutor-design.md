# Diseño del Profesor IA Integrado en ApuntesApp

## Parte 1: El Menú Flotante Inteligente (Interacción Textual Directa)

El "Profesor Omnipresente" no será un chat aislado, sino un asistente contextual directamente en el lienzo. Al seleccionar un fragmento de texto en los apuntes (como una fórmula matemática o un concepto teórico):

- Aparecerá un pequeño **tooltip flotante** sobre la selección.
- Tendrá accesos directos impulsados por Gemini: `🪄 Explicar`, `🎓 Generar Ejercicio`, o `📝 Resumir`.
- El resultado generado por Gemini no te llevará fuera de la página; se inyectará como un bloque expandible (un "Bloque IA") justo debajo del texto seleccionado o lo reemplazará según la intención del usuario.

## Parte 2: Bloques de Evaluación Interactivos (Quizzes en Contexto)

Para el "Modo Evaluación", la experiencia es inmersiva.

- Cuando el estudiante solicite practicar, Gemini generará un componente de **Bloque Interactivo** dentro de la misma nota.
- Aparecerá una pregunta o problema (ej. "Resuelve esta derivada").
- El bloque tendrá una caja de texto para que el estudiante responda paso a paso.
- Al enviar, el bloque validará la respuesta internamente con Gemini, mostrando feedback visual (✅/❌) y una explicación correctiva. El historial de intentos quedará visible para estudiar los propios errores.

## Parte 3: Brazalete de Superpoderes (Análisis Mágico de Documentos)

Para procesar apuntes externos (fotos de pizarras, exámenes escaneados o PDFs):

- Se añadirá un botón mágico al crear o editar una nota: `✨ Importar con IA`.
- El estudiante subirá un PDF de su materia de matemáticas o la foto de una pizarra.
- Gemini Vision analizará el documento, extraerá el problema y sus pasos, o el temario completo de la clase, y lo convertirá en un **Apunte Estructurado en Markdown**.
- Si detecta un ejercicio matemático (ej. de una foto de un examen), lo transcribirá a LaTeX (para su correcta renderización) y lo resolverá paso a paso, guardando la solución como un apunte limpio y digital.

## Arquitectura y Tecnologías

- **Next.js 15 (App Router)**: Componentes Server/Client y Server Actions o APIs para conectar con Gemini.
- **`@google/generative-ai`**: Uso de `gemini-2.0-flash` para la velocidad extrema que requiere la generación in-line.
- **Framer Motion**: Para las animaciones fluidas del tooltip y la aparición de los bloques de evaluación.
- **Markdown / LaTeX Renderer**: Procesaremos la salida de Gemini matemáticamente con algún renderer de Markdown compatible con Math/LaTeX (ej. React Markdown + remark-math + rehype-katex) para que las fórmulas se vean espectaculares.
