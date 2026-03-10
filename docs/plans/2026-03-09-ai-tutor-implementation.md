# AI Tutor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate Gemini 2.0 Flash to act as an AI Tutor with inline interactive blocks and contextual popups in ApuntesApp.

**Architecture:** We will create a `AITooltip` component that appears on text selection using framer-motion. A Server Action `lib/ai/actions.ts` will connect to Gemini. Interaction outputs will append specific UI Blocks (like explanations) into the note context or state.

**Tech Stack:** Next.js Server Actions, `@google/generative-ai`, framer-motion, Tailwind CSS.

---

### Task 1: Create Server Action for Gemini Integration

**Files:**

- Create: `lib/ai/actions.ts`

**Step 1: Write the failing Server Action**
*(No test framework, testing manually)*

**Step 2: Write minimal implementation**

```typescript
"use server"
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function explainContext(textContext: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(`Eres un profesor experto. Explícame esto de forma sencilla: ${textContext}`);
  const response = await result.response;
  return response.text();
}
```

**Step 3: Commit**

```bash
git add lib/ai/actions.ts
git commit -m "feat: setup gemini server action for tutor"
```

### Task 2: Create `AITooltip` Component

**Files:**

- Create: `components/ai/AITooltip.tsx`

**Step 1: Write minimal implementation**

```tsx
"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { explainContext } from '@/lib/ai/actions';

export default function AITooltip() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  
  useEffect(() => {
    const handleMouseUp = () => {
      if (explanation) return;
      
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== "") {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setPosition({ x: rect.left + rect.width / 2, y: rect.top - 50 });
        setSelectedText(selection.toString());
      } else {
        setSelectedText("");
      }
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [explanation]);

  const handleExplain = async () => {
     setLoading(true);
     const response = await explainContext(selectedText);
     setExplanation(response);
     setLoading(false);
  };

  const closeExplanation = () => {
     setExplanation("");
     setSelectedText("");
  };

  return (
    <>
      <AnimatePresence>
        {selectedText && !explanation && (
          <motion.div 
             initial={{opacity: 0, scale: 0.9}} 
             animate={{opacity: 1, scale: 1}} 
             exit={{opacity: 0}}
             style={{ position: 'fixed', left: position.x, top: position.y, transform: 'translateX(-50%)', zIndex: 50 }}
             className="bg-black/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl cursor-pointer flex gap-3 items-center border border-white/10"
          >
            <button onClick={handleExplain} className="hover:text-amber-300 font-medium whitespace-nowrap text-sm">
              {loading ? "🪄 Pensando..." : "🪄 Explicar esto con IA"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
         {explanation && (
            <motion.div 
               initial={{opacity: 0, y: 20}} 
               animate={{opacity: 1, y: 0}} 
               className="fixed bottom-10 right-10 w-96 max-h-[60vh] overflow-y-auto bg-zinc-900/95 backdrop-blur border border-white/10 p-5 rounded-2xl shadow-2xl z-50 text-white"
            >
               <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg text-amber-300">🪄 Profesor IA</h3>
                  <button onClick={closeExplanation} className="text-zinc-400 hover:text-white">✕</button>
               </div>
               <div className="text-sm leading-relaxed text-zinc-300">
                  {explanation}
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </>
  );
}
```

**Step 2: Commit**

```bash
git add components/ai/AITooltip.tsx
git commit -m "feat: ai tooltip contextual menu component"
```

### Task 3: Integrate AITooltip globally

**Files:**

- Modify: `app/layout.tsx` (Inject AITooltip so it works everywhere in the app)

**Step 1: Write minimal implementation**

```tsx
import AITooltip from '@/components/ai/AITooltip';
// Inside body
<AITooltip />
```

**Step 2: Commit**

```bash
git commit -am "feat: integrate AITooltip globally"
```
