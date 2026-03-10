---
name: inbox-ia-pro
description: "Expert guide for enhancing the Intelligent Inbox IA® (Inbox Inteligente IA®). Use this skill when the user wants to improve, redesign, or add advanced features to the email inbox module, including professional UI/UX (Scientific Luxury), AI-driven message categorization, urgency detection, and IMAP synchronization workflows."
---

# Inbox Inteligente IA® - Professional Skill

This skill provides procedural knowledge to transform a basic email inbox into a high-performance "Intelligent Inbox" powered by AI, specifically tailored for the **Letreros Caperuso** ERP.

## Design Philosophy: Scientific Luxury

Follow these visual guidelines for any UI modifications to the Inbox module:

- **Layout**: Use a **Three-Panel Symmetrical Design**:
  - **Left Sidebar**: Folder navigation and dynamic account selector.
  - **Center Column**: Scrollable email list with rich metadata (priority, category, date).
  - **Right Detail Pane**: Message viewer with AI Reasoning overlay.
- **Visual Atoms**:
  - **Glassmorphism**: Use `backdrop-filter: blur(20px)` for glass cards.
  - **Emerald Accents**: Use `--ai-accent-emerald` (#10b981) for neural indicators.
  - **Neural Monitoring**: Include a **Monitor IA** at the bottom of the list indicating current scanning status.
- **Typography**: Use **Outfit** or **Space Grotesk** for clean, futuristic headings.

## AI Reasoning System

Every email selected should trigger an AI-based analysis. The reasoning box must:

1. **Categorize**: Identify if it's "Administrativo", "Finanzas", "Suministros", "Ventas" or "Logística".
2. **Estimate Urgency**: Assign a level (Low, Medium, High, Critical).
3. **Propose Action**: Offer a specific next step (e.g., "Generar Cotización", "Actualizar Precios", "Contactar Cliente").
4. **Connect Data**: Reference ERP data (e.g., specific materials like "Aluminio 3mm", "Acrílico Opal").

## Common Workflows

### 1. Account Switching

Update the `INBOX_IA_ACCOUNTS` in `src/core/config.js` and ensure the `switchIAMailbox` function correctly:

- Updates the `Monitor IA` display.
- Clears the message viewer.
- Reloads the `loadEmailInbox()` with account-specific data.

### 2. Message Detail Preview

Implementing the `viewEmail(emailId)` function:

- Load the full email content.
- Dynamically generate the `RAZONAMIENTO IA` block based on email text.
- Highlight keywords of interest to the business (Clients, Budgets, Materials).

### 3. Folder Navigation

Use `setActiveInboxFolder(folderId)` to manage UI state, changing the background of the active button and filtering the email list.

## Reference Material

- **[scenarios.md](references/scenarios.md)**: Real email examples for training AI reasoning and testing UI edge cases.
- **[output-patterns.md](references/output-patterns.md)**: Templates for the AI reasoning response and notification styles.

## Tools & Assets

- **scripts/sync_emails.php**: Backend placeholder for IMAP connections.
- **assets/icons/**: SVG icons for professional email actions (Reply, Forward, Archive, Trash).
