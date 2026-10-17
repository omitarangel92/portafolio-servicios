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

Al abrir el sitio se solicita permiso al micrófono y comienza la escucha. El navegador graba cada frase cuando detecta voz y la envía al Worker; Gemini la transcribe y genera la respuesta en una sola solicitud. Así no depende del servicio de reconocimiento de voz del navegador y evita una llamada adicional por pregunta. El visitante puede pausar y reanudar el micrófono con el botón del avatar. Si se deniega el permiso, habrá que habilitarlo en la configuración del navegador y pulsar «Activar micrófono». No hay entrada de texto.

El retrato se mantiene estático mientras el sintetizador reproduce las respuestas. Para animación 2D, prepara la imagen en capas y rige un personaje con Live2D Cubism o Rive; una imagen PNG plana no permite un movimiento de boca natural. Los servicios de avatar en video pueden animar un retrato, pero suelen cobrar por uso.

El Worker acepta preguntas de texto de hasta 1000 caracteres y audio de hasta aproximadamente 1 MB. Si Gemini responde HTTP 429, se agotó una cuota del proyecto (por ejemplo, solicitudes por minuto o por día); comprueba la cuota y el modelo habilitado para la clave en Google AI Studio. Reducir llamadas ayuda, pero no elimina esos límites.

## Información personal y voz propia

El asistente no necesita reentrenar un modelo: su perfil se define en `SYSTEM_PROMPT`. Para respuestas fiables, amplía ese perfil con una biografía aprobada, servicios, proyectos, experiencia y respuestas a preguntas frecuentes. Incluye solo información que quieras publicar y evita datos privados o sensibles.

La voz actual es la voz española instalada en el navegador; no clona la voz de Omar. Para usar una voz clonada se necesita un proveedor de síntesis con clonación, muestras de voz con permiso y una API que se invoque desde el Worker. Confirma sus condiciones, precios y tratamiento de las grabaciones antes de elegirlo; nunca expongas su clave en el JavaScript del sitio.
