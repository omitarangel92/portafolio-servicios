const AI_ENDPOINT = "https://ratimo-portfolio-avatar.ratimo-design-omar92.workers.dev";
const MAX_QUESTION_LENGTH = 1000;

export function initInteractiveAvatar() {
    const avatarCard = document.getElementById("talking-avatar-card");
    const response = document.getElementById("avatar-response");
    const status = document.getElementById("avatar-status");
    const micButton = document.getElementById("avatar-mic");
    const stopButton = document.getElementById("avatar-stop");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!avatarCard || !response || !status || !micButton || !stopButton) {
        return;
    }

    const synth = window.speechSynthesis;
    const conversation = [];
    let recognition;
    let listening = false;
    let recognitionActive = false;
    let busy = false;
    let restartTimer;

    const setStatus = (message) => {
        status.textContent = message;
    };

    const updateMicButton = () => {
        micButton.setAttribute("aria-pressed", String(listening));
        micButton.innerHTML = listening
            ? '<i class="fas fa-microphone-slash" aria-hidden="true"></i> Pausar micrófono'
            : '<i class="fas fa-microphone" aria-hidden="true"></i> Activar micrófono';
    };

    const scheduleListening = () => {
        window.clearTimeout(restartTimer);
        if (!listening || busy || !recognition) {
            return;
        }

        restartTimer = window.setTimeout(() => {
            try {
                recognition.start();
            } catch (error) {
                if (!(error instanceof DOMException && error.name === "InvalidStateError")) {
                    listening = false;
                    updateMicButton();
                    setStatus("No se pudo activar el micrófono. Pulsa «Activar micrófono» para volver a intentarlo.");
                }
            }
        }, 250);
    };

    const resumeListening = () => {
        busy = false;
        setStatus("Respuesta terminada. Te escucho...");
        scheduleListening();
    };

    const stopSpeaking = () => {
        if (synth) {
            synth.cancel();
        }
        avatarCard.classList.remove("avatar-animating-talk", "avatar-mouth-moving");
        if (busy) {
            resumeListening();
        }
    };

    const speak = (text) => {
        if (!synth || typeof window.SpeechSynthesisUtterance !== "function") {
            response.textContent = text;
            resumeListening();
            setStatus("La voz no está disponible; la respuesta quedó escrita arriba.");
            return;
        }

        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.lang = "es-CO";
        utterance.rate = 0.96;
        utterance.onstart = () => {
            avatarCard.classList.add("avatar-animating-talk");
            setStatus("El avatar está respondiendo...");
        };
        utterance.onboundary = (event) => {
            if (event.name !== "word" && typeof event.charLength !== "number") {
                return;
            }

            avatarCard.classList.remove("avatar-mouth-moving");
            avatarCard.style.setProperty(
                "--avatar-mouth-duration",
                `${Math.min(600, Math.max(140, (event.charLength || 3) * 65))}ms`
            );
            requestAnimationFrame(() => avatarCard.classList.add("avatar-mouth-moving"));
        };
        utterance.onend = () => {
            avatarCard.classList.remove("avatar-animating-talk", "avatar-mouth-moving");
            resumeListening();
        };
        utterance.onerror = () => {
            avatarCard.classList.remove("avatar-animating-talk", "avatar-mouth-moving");
            resumeListening();
            setStatus("No se pudo reproducir la respuesta. Te escucho de nuevo.");
        };
        synth.cancel();
        synth.speak(utterance);
    };

    const ask = async (question) => {
        const cleanQuestion = question.trim().slice(0, MAX_QUESTION_LENGTH);
        if (!cleanQuestion) {
            resumeListening();
            return;
        }

        response.textContent = `Te escuché: «${cleanQuestion}»`;
        busy = true;
        setStatus("Estoy preparando una respuesta...");

        if (!AI_ENDPOINT) {
            const message = "Te escuché, pero todavía no tengo conexión con la inteligencia artificial. Falta configurar y publicar el servicio Gemini del portafolio.";
            response.textContent = message;
            speak(message);
            return;
        }

        try {
            const apiResponse = await fetch(AI_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: cleanQuestion,
                    history: conversation.slice(-8)
                })
            });
            const data = await apiResponse.json();

            if (!apiResponse.ok) {
                throw new Error(data.error || "El servicio de IA no pudo responder.");
            }
            if (typeof data.reply !== "string" || !data.reply.trim()) {
                throw new Error("El servicio de IA devolvió una respuesta vacía.");
            }

            const reply = data.reply.trim();
            response.textContent = reply;
            conversation.push(
                { role: "user", text: cleanQuestion },
                { role: "model", text: reply }
            );
            conversation.splice(0, Math.max(0, conversation.length - 12));
            speak(reply);
        } catch (error) {
            const message = error instanceof Error
                ? `No se pudo obtener una respuesta: ${error.message}`
                : "No se pudo conectar con el asistente. Intenta de nuevo.";
            response.textContent = message;
            speak(message);
        }
    };

    const startConversation = async () => {
        if (!recognition) {
            setStatus("Este navegador no admite reconocimiento de voz. Prueba la página en Chrome o Edge actualizado.");
            return;
        }

        listening = true;
        updateMicButton();
        setStatus("Solicitando permiso para usar el micrófono...");

        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                scheduleListening();
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track) => track.stop());
            if (listening) {
                setStatus("Permiso concedido. Te escucho...");
                scheduleListening();
            }
        } catch (error) {
            listening = false;
            updateMicButton();
            setStatus(error instanceof DOMException && error.name === "NotAllowedError"
                ? "No se concedió permiso para el micrófono. Actívalo en el navegador y pulsa «Activar micrófono»."
                : "No se pudo acceder al micrófono. Revisa la conexión y los permisos del navegador.");
        }
    };

    if (!SpeechRecognition) {
        micButton.disabled = true;
        setStatus("Este navegador no admite reconocimiento de voz. Prueba la página en Chrome o Edge actualizado.");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "es-CO";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => {
        recognitionActive = true;
        setStatus("Te escucho. Haz tu pregunta.");
    };
    recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
            if (event.results[index].isFinal) {
                finalTranscript += event.results[index][0].transcript;
            }
        }

        if (finalTranscript.trim() && !busy) {
            busy = true;
            recognition.stop();
            ask(finalTranscript);
        }
    };
    recognition.onerror = (event) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            listening = false;
            updateMicButton();
            setStatus("No se concedió permiso para el micrófono o el servicio de voz. Revisa los permisos y vuelve a activarlo.");
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
            setStatus("Hubo un problema con el reconocimiento de voz. Intentaré escucharte de nuevo.");
        }
    };
    recognition.onend = () => {
        recognitionActive = false;
        if (!busy) {
            scheduleListening();
        }
    };

    micButton.addEventListener("click", () => {
        if (listening) {
            listening = false;
            window.clearTimeout(restartTimer);
            if (recognitionActive) {
                recognition.abort();
            }
            stopSpeaking();
            updateMicButton();
            setStatus("Micrófono pausado.");
            return;
        }
        startConversation();
    });

    stopButton.addEventListener("click", () => {
        stopSpeaking();
        if (!busy) {
            setStatus(listening ? "Te escucho." : "Voz detenida.");
        }
    });

    startConversation();
}
