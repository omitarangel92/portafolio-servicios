import { initThreeBackground } from "./three-background.js";
import { initAnimations } from "./animations.js";
import { initProjects } from "./projects-carousel.js";
import { initContact } from "./contact.js";
import { initTheme } from "./theme.js";
import { initTools, initDesigns } from "./sections.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initThreeBackground();
  initProjects();
  initContact();
  initTools();
  initDesigns();
  initAnimations();
  setupModal();
});

function setupModal() {
  const modal = document.getElementById("image-modal"), img = document.getElementById("modal-img");
  const close = () => (modal.style.display = "none");
  document.querySelectorAll("[data-full]").forEach((t) =>
    t.addEventListener("click", () => { img.src = t.dataset.full; modal.style.display = "flex"; }));
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.classList.contains("modal-close")) close(); });
  document.addEventListener("keydown", (e) => e.key === "Escape" && close());
}







// src/ai-avatar.js

export function initInteractiveAvatar() {
    const avatarImg = document.getElementById('avatar-speaking-img');
    const avatarCard = document.getElementById('talking-avatar-card');
    
    const welcomeText = "Hola... soy el avatar de Omar Angel, si necesitas consultarme algo sólo pregúntame y yo te respondo.";
    
    // Configuración del sintetizador de voz nativo (Gratis)
    const synth = window.speechSynthesis;
    let isSpeaking = false;

    // Función para emitir voz y animar la boca de la imagen tu-avatar.png
    function speakAndAnimate(text, onComplete) {
        if (!synth) return;
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            isSpeaking = true;
            avatarCard.classList.add('avatar-animating-talk');
        };

        utterance.onend = () => {
            isSpeaking = false;
            avatarCard.classList.remove('avatar-animating-talk');
            if (onComplete) onComplete();
        };

        synth.speak(utterance);
    }

    // Saludo inicial al cargar / interactuar
    let initialGreetingDone = false;
    function triggerInitialGreeting() {
        if (!initialGreetingDone) {
            initialGreetingDone = true;
            speakAndAnimate(welcomeText, () => {
                startListeningForQuestions(); // Iniciar escucha atenta
            });
        }
    }

    // Escuchar preguntas del usuario por micrófono (Web Speech API)
    function startListeningForQuestions() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = async (event) => {
            const userQuery = event.results[0][0].transcript;
            console.log("Usuario preguntó:", userQuery);

            // Consultar a la IA (n8n Webhook / Gemini API)
            const aiReply = await fetchAIReply(userQuery);
            speakAndAnimate(aiReply);
        };

        // Iniciar al hacer clic en el avatar
        avatarCard.addEventListener('click', () => {
            if (!isSpeaking) {
                recognition.start();
            }
        });
    }

    // Conexión gratuita con n8n / Gemini LLM
    async function fetchAIReply(query) {
        try {
            // Ejemplo de endpoint a tu webhook de n8n o función backend gratuita
            const response = await fetch('https://tu-n8n-instance.com/webhook/portfolio-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query })
            });
            const data = await response.json();
            return data.output || "Omar es Ingeniero de Sistemas especializado en UX/UI y Front-End. Puedes revisar sus proyectos en el portafolio.";
        } catch (error) {
            return "Puedo contarte sobre los proyectos de Omar como NEBUFIT30 o el Juego del Impostor, o su experiencia en AstraZeneca.";
        }
    }

    // Iniciar el saludo
    window.addEventListener('click', triggerInitialGreeting, { once: true });
    window.addEventListener('scroll', triggerInitialGreeting, { once: true });
}