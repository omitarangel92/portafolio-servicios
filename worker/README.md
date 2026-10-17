# Asistente del portafolio

El sitio de GitHub Pages no debe contener la clave de Gemini. Este Worker la conserva como secreto y devuelve las respuestas al avatar.
El Worker usa `gemini-3.8-flash` mediante la API `generateContent`.

## Despliegue

1. Crea una clave de Gemini en Google AI Studio, desde tu propia cuenta.
2. Desde la raíz del repositorio, instala Wrangler o ejecútalo con `npx` y guarda la clave como secreto:

   ```powershell
   npx wrangler secret put GEMINI_API_KEY --config worker/wrangler.toml
   ```

3. Despliega el Worker:

   ```powershell
   npx wrangler deploy --config worker/wrangler.toml
   ```

4. Copia la URL `workers.dev` que entrega Cloudflare y reemplaza el valor vacío de `AI_ENDPOINT` al inicio de `src/ai-avatar.js`. Vuelve a publicar el sitio de GitHub Pages.
5. Para probar localmente con Vite, el Worker permite los orígenes `localhost` y `127.0.0.1` en los puertos `5173` y `3000`.

La clave solo se introduce en el prompt de Wrangler; nunca la pegues en el HTML, JavaScript del sitio ni en Git, ni la envíes por chat. `ALLOWED_ORIGIN` en `wrangler.toml` debe coincidir con el origen público del portafolio.

## Voz y avatar

Al abrir el sitio se solicita permiso al micrófono y comienza la escucha. El visitante puede pausar y reanudarla con el botón del avatar. El reconocimiento de voz depende del navegador y del contexto seguro HTTPS; está disponible, por ejemplo, en Chrome y Edge. Si se deniega el permiso, habrá que habilitarlo en el navegador y pulsar «Activar micrófono». No hay entrada de texto.

La imagen actual es una ilustración fija. La boca superpuesta se anima mientras habla el sintetizador y usa los eventos de voz del navegador para aproximar los movimientos por palabra; no es sincronización labial fonética exacta. Para obtener labios realistas harían falta imágenes con distintas formas de boca o un avatar de video.

El Worker acepta preguntas de hasta 1000 caracteres y limita el tamaño de las respuestas. El endpoint es público para que GitHub Pages pueda llamarlo; revisa el consumo de Gemini y configura límites de uso o facturación en Google Cloud.
