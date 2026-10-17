# Asistente del portafolio

El sitio de GitHub Pages no debe contener la clave de xAI. Este Worker la conserva como secreto y devuelve las respuestas de Grok al avatar.
El Worker usa `grok-3-mini` mediante la API de chat completions de xAI.

## Despliegue

1. Crea una clave de API desde tu cuenta de xAI.
2. Desde la raíz del repositorio, guarda la clave como secreto de Cloudflare:

   ```powershell
   npx wrangler secret put GROK_API_KEY --config worker/wrangler.toml
   ```

   Wrangler te pedirá pegar la clave en la terminal. No la pegues aquí ni la guardes en archivos del repositorio.
3. Despliega el Worker:

   ```powershell
   npx wrangler deploy --config worker/wrangler.toml
   ```

4. Si el despliegue termina correctamente, puedes borrar el secreto antiguo de Gemini:

   ```powershell
   npx wrangler secret delete GEMINI_API_KEY --config worker/wrangler.toml
   ```

5. Para probar localmente con Vite, el Worker permite los orígenes `localhost` y `127.0.0.1` en los puertos `5173` y `3000`.

La clave solo se introduce en el prompt de Wrangler; nunca la pegues en el HTML, JavaScript del sitio ni en Git, ni la envíes por chat. `ALLOWED_ORIGIN` en `wrangler.toml` debe coincidir con el origen público del portafolio. El endpoint configurado en `src/ai-avatar.js` permanece igual; no es necesario volver a publicar GitHub Pages al cambiar el modelo del Worker.

## Voz y avatar

Al abrir el sitio se solicita permiso al micrófono y comienza la escucha. El visitante puede pausar y reanudarla con el botón del avatar. El reconocimiento de voz depende del navegador y del contexto seguro HTTPS; está disponible, por ejemplo, en Chrome y Edge. Si se deniega el permiso, habrá que habilitarlo en el navegador y pulsar «Activar micrófono». No hay entrada de texto.

La imagen actual es una ilustración fija. La boca superpuesta se anima mientras habla el sintetizador y usa los eventos de voz del navegador para aproximar los movimientos por palabra; no es sincronización labial fonética exacta. Para obtener labios realistas harían falta imágenes con distintas formas de boca o un avatar de video.

El Worker acepta preguntas de hasta 1000 caracteres y limita el tamaño de las respuestas. El endpoint es público para que GitHub Pages pueda llamarlo; revisa el consumo y los límites de uso de xAI.
