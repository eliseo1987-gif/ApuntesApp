---
description: Iniciar el servidor de desarrollo y el puente IMAP para el Inbox IA
---

# Start Dev Server + IMAP Bridge

Este workflow inicia el servidor HTTP local y el puente IMAP para sincronizar correos reales.

## Pasos

1. Detener procesos previos en puertos 8080 y 8081 (si están corriendo)

```bash
pkill -f "imap_bridge.py" 2>/dev/null; lsof -ti :8080 | xargs kill -9 2>/dev/null; sleep 1
```

// turbo
2. Iniciar el puente IMAP (puerto 8081) en background

```bash
python3 /Users/letreroscaperuso/.gemini/antigravity/playground/exo-celestial/imap_bridge.py &
```

// turbo
3. Iniciar el servidor web (puerto 8080) en background

```bash
cd /Users/letreroscaperuso/.gemini/antigravity/playground/exo-celestial && python3 -m http.server 8080 &
```

// turbo
4. Verificar que ambos servidores están corriendo

```bash
sleep 2 && lsof -i :8080 | grep LISTEN && lsof -i :8081 | grep LISTEN && echo "✅ Servidores activos"
```

1. Abrir en el navegador: <http://localhost:8080>
