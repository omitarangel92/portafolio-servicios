# Asistente del portafolio

El sitio de GitHub Pages no necesita claves de proveedor de IA. El Worker ejecuta Whisper para transcribir audio y Llama para responder mediante Cloudflare Workers AI.

## Despliegue

1. Asegúrate de estar autenticado en Cloudflare con Wrangler.
2. Despliega el Worker, que ya declara el binding `AI` en `wrangler.toml`:

   ```powershell
   npx wrangler deploy --config worker/wrangler.toml
   ```

3. No se necesita crear ni guardar una clave de Gemini/xAI para inferencia.

El binding `AI` conecta el Worker con el catálogo de Workers AI. `ALLOWED_ORIGIN` en `wrangler.toml` debe coincidir con el origen público del portafolio. Para probar localmente con Vite, el Worker permite los orígenes `localhost` y `127.0.0.1` en los puertos `5173` y `3000`.

## Voz y avatar

Al abrir el sitio se solicita permiso al micrófono y comienza la escucha. El navegador graba cada frase que detecta y la envía al Worker; Whisper (en español y con filtro de actividad de voz) la transcribe y Llama genera la respuesta. Son dos inferencias de Workers AI para cada turno por voz, así que este cambio reemplaza los límites de Gemini por la cuota diaria compartida de Cloudflare; no garantiza respuestas más rápidas. El sitio no depende del servicio de reconocimiento de voz del navegador. El visitante puede pausar y reanudar el micrófono con el botón del avatar. Si se deniega el permiso, habrá que habilitarlo en la configuración del navegador y pulsar «Activar micrófono». No hay entrada de texto.

Al cargar la página, el avatar intenta saludar en voz alta con la voz española disponible en el navegador, priorizando voces de Colombia y otros países latinoamericanos. Algunos navegadores bloquean la reproducción automática; en ese caso el saludo queda anunciado en pantalla y el visitante puede activar el micrófono para conversar. El control de ganancia automática y un umbral de voz más sensible ayudan a captar voces bajas, aunque el resultado también depende del micrófono y del ruido ambiente. El retrato se mantiene estático mientras el sintetizador reproduce las respuestas.

El texto de las respuestas permanece oculto visualmente, aunque accesible para lectores de pantalla. La voz habla en primera persona como Omar y se limita a respuestas breves (máximo dos frases y 30 palabras).

El Worker acepta preguntas de texto de hasta 1000 caracteres y audio de hasta aproximadamente 1 MB. Cloudflare documenta una asignación gratuita de Workers AI de 10.000 Neurons por día en los planes Free y Paid, compartida entre los usos de Workers AI de la cuenta y reiniciada a las 00:00 UTC. No es ilimitada: si se consume, las solicitudes fallan hasta el siguiente reinicio. Consulta el uso en el panel de Workers AI y los límites por tarea en la documentación oficial. Whisper se cobra por minuto de audio y Llama por tokens; el consumo de cada conversación depende de su duración y tokens de entrada/salida.

## Información personal y voz propia

El asistente no necesita reentrenar un modelo: su perfil se define en `SYSTEM_PROMPT`. Contiene la información laboral y educativa publicada en el portafolio, además de los datos personales que Omar autorizó que el avatar comparta si se los preguntan. No se añade una biografía visible a la página. Como el chatbot es público, cualquier dato incluido en ese perfil puede ser revelado por sus respuestas; evita añadir información sensible.

La voz actual es la voz española instalada en el navegador; no clona la voz de Omar. Para usar una voz clonada se necesita un proveedor de síntesis con clonación, muestras de voz con permiso y una API que se invoque desde el Worker. Confirma sus condiciones, precios y tratamiento de las grabaciones antes de elegirlo; nunca expongas su clave en el JavaScript del sitio.
