# AI Magic Import Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the "Brazalete de Superpoderes" to allow users to upload images (like a photo of a whiteboard) or PDFs, and use Gemini 2.0 Vision to extract the information as structured markdown (including LaTeX for math) to populate a note.

**Architecture:**

- `lib/ai/visionActions.ts`: A server action that receives an image/pdf as base64 and its mimeType, then sends it to `gemini-2.0-flash` (which supports multimodal data) with a strict prompt to extract and structure educational content.
- `components/ai/MagicImportButton.tsx`: A client component (a button) that opens a file picker. Upon selection, it converts the file to base64, calls the server action, and returns the markdown text.
- Integration into `app/notes/edit/page.tsx` and `app/notes/new/page.tsx`.

**Tech Stack:** Next.js Server Actions, `@google/generative-ai`, standard Web File API.

---

### Task 1: Create Vision Server Action

**Files:**

- Create: `lib/ai/visionActions.ts`

**Step 1: Write minimal implementation**

```typescript
"use server"
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function extractContentFromFile(base64Data: string, mimeType: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const prompt = `Eres un asistente educativo avanzado. Transforma el documento/imagen adjunto en un apunte digital estructurado en formato Markdown.
Reglas:
1. Extrae y estructura todo el texto, conceptos y temas clave.
2. Si detectas problemas matemáticos o fórmulas, extráelos y resuélvelos paso a paso usando formato LaTeX (ej: $$ x^2 + y^2 = z^2 $$).
3. Usa encabezados, viñetas y negritas para hacerlo fácil de estudiar.
Devuelve SOLO el Markdown resultante, sin textos introductorios.`;

  const imageParts = [
    {
      inlineData: {
        data: base64Data,
        mimeType
      }
    }
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  return response.text();
}
```

**Step 2: Commit**

```bash
git add lib/ai/visionActions.ts
git commit -m "feat: server action for multimodal extraction of notes"
```

### Task 2: Create MagicImportButton Component

**Files:**

- Create: `components/ai/MagicImportButton.tsx`

**Step 1: Write component**
This component renders an invisible `<input type="file" />` and a shiny button. It handles the `File -> Base64` conversion and calls the server action. It takes an `onExtracted(markdown: string)` prop.

### Task 3: Integrate into Editor

**Files:**

- Modify: `app/notes/edit/page.tsx` to include the `<MagicImportButton onExtracted={(text) => appendContent(text)} />` in the header or toolbar.
