# Output Patterns: AI Reasoning Overlay

Use these patterns to format the `RAZONAMIENTO IA` block within the email viewer.

## Pattern 1: Opportunity for Quotation (Ventas)

```html
<div class="ai-reasoning-overlay">
  <div class="ai-reasoning-title">
    <span class="pulse-emerald"></span>
    RAZONAMIENTO IA: Oportunidad detectada
  </div>
  <div class="ai-reasoning-body">
    Este mensaje representa una oportunidad de negocio directa. El cliente parece tener urgencia. Sugiero generar una cotización de "Letreros de Seguridad" usando el material "Aluminio 3mm" basado en su historial.
  </div>
  <div class="ai-reasoning-actions">
    <button class="btn-ia-action">Generar Cotización</button>
  </div>
</div>
```

## Pattern 2: Financial Update (Finanzas)

```html
<div class="ai-reasoning-overlay">
  <div class="ai-reasoning-title">
    <span class="pulse-emerald"></span>
    RAZONAMIENTO IA: Alerta de Costos
  </div>
  <div class="ai-reasoning-body">
    Este correo informa un alza de precios en insumos críticos (Aluminio). Se recomienda revisar las cotizaciones abiertas para ajustar márgenes.
  </div>
  <div class="ai-reasoning-actions">
    <button class="btn-ia-action">Ver Cotizaciones Afectadas</button>
  </div>
</div>
```

## Pattern 3: Administrative/Internal (Administrativo)

```html
<div class="ai-reasoning-overlay">
  <div class="ai-reasoning-title">
    <span class="pulse-emerald"></span>
    RAZONAMIENTO IA: Tarea para Gestión
  </div>
  <div class="ai-reasoning-body">
    Se requiere firma de documentos para la liquidación mensual. Se ha agendado un recordatorio para el administrador.
  </div>
</div>
```

### CSS Guidelines for Reasoning Box

- **Background**: `rgba(16, 185, 129, 0.05)` (Emerald faint)
- **Border-left**: `4px solid #10b981` (Emerald accent)
- **Padding**: `1.2rem`
- **Margin-top**: `2rem`
- **Blur**: `backdrop-filter: blur(8px)`
