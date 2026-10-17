const AI_ENDPOINT = "https://ratimo-portfolio-avatar.ratimo-design-omar92.workers.dev";
const MAX_QUESTION_LENGTH = 1000;
const MAX_RECORDING_MS = 15000;
const SILENCE_DURATION_MS = 850;
const AUDIO_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

export function initInteractiveAvatar() {
    const response = document.getElementById("avatar-response");
    const status = document.getElementById("avatar-status");
    const micButton = document.getElementById("avatar-mic");
    const stopButton = document.getElementById("avatar-stop");

    if (!response || !status || !micButton || !stopButton) {
        return;
    }

    const synth = window.speechSynthesis;
    const conversation = [];
    let listening = false;
    let busy = false;
    let mediaStream;
    let audioContext;
    let analyser;
    let monitorFrame;
    let recorder;
    let recordingStartedAt = 0;
    let silenceStartedAt = 0;
    let voiceFrames = 0;
    let recordingTimer;
    const discardedRecorders = new WeakSet();
    let noiseFloor = 0.005;

    const setStatus = (message) => {
        status.textContent = message;
    };

    const updateMicButton = () => {
        micButton.setAttribute("aria-pressed", String(listening));
        micButton.innerHTML = listening
            ? '<i class="fas fa-microphone-slash" aria-hidden="true"></i> Pausar micrófono'
            : '<i class="fas fa-microphone" aria-hidden="true"></i> Activar micrófono';
    };

    const resumeListening = () => {
        busy = false;
        if (listening) {
            setStatus("Respuesta terminada. Te escucho...");
        }
    };

    const stopSpeaking = () => {
        if (synth) {
            synth.cancel();
        }
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
            setStatus("El avatar está respondiendo...");
        };
        utterance.onend = () => {
            resumeListening();
        };
        utterance.onerror = () => {
            resumeListening();
            setStatus("No se pudo reproducir la respuesta. Te escucho de nuevo.");
        };
        synth.cancel();
        synth.speak(utterance);
    };

    const sendQuestion = async (question) => {
        const cleanQuestion = question.trim().slice(0, MAX_QUESTION_LENGTH);
        if (!cleanQuestion) {
            resumeListening();
            return;
        }

        response.textContent = `Te escuché: «${cleanQuestion}»`;
        busy = true;
        setStatus("Estoy preparando una respuesta...");

        if (!AI_ENDPOINT) {
            const message = "Todavía no hay conexión con la inteligencia artificial. Falta configurar el servicio Gemini del portafolio.";
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
            const message = error instanceof TypeError
                ? "No se pudo conectar con Cloudflare. Revisa la conexión y el permiso CORS del Worker para este sitio."
                : error instanceof Error
                    ? `No se pudo obtener una respuesta: ${error.message}`
                    : "No se pudo conectar con el asistente. Intenta de nuevo.";
            response.textContent = message;
            speak(message);
        }
    };

    const answerRecording = async (blob) => {
        if (!AI_ENDPOINT) {
            throw new Error("Falta configurar el servicio Gemini del portafolio.");
        }

        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("No se pudo leer el audio grabado."));
            reader.readAsDataURL(blob);
        });
        const separatorIndex = dataUrl.indexOf(",");
        if (separatorIndex < 0) {
            throw new Error("El formato del audio grabado no es válido.");
        }

        const mimeType = blob.type.split(";")[0].toLowerCase();
        const apiResponse = await fetch(AI_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                audio: dataUrl.slice(separatorIndex + 1),
                mimeType,
                history: conversation.slice(-8)
            })
        });
        const data = await apiResponse.json();
        if (!apiResponse.ok) {
            throw new Error(data.error || "Gemini no pudo procesar el audio.");
        }
        if (typeof data.transcript !== "string" || !data.transcript.trim()) {
            throw new Error("No se reconocieron palabras. Intenta hablar más cerca del micrófono.");
        }
        if (typeof data.reply !== "string" || !data.reply.trim()) {
            throw new Error("Gemini no devolvió una respuesta. Intenta de nuevo.");
        }
        return { transcript: data.transcript.trim(), reply: data.reply.trim() };
    };

    const handleRecording = async (blob) => {
        if (blob.size === 0) {
            resumeListening();
            return;
        }

        busy = true;
        setStatus("Entendiendo tu pregunta y preparando una respuesta...");
        try {
            const { transcript, reply } = await answerRecording(blob);
            response.textContent = reply;
            conversation.push(
                { role: "user", text: transcript },
                { role: "model", text: reply }
            );
            conversation.splice(0, Math.max(0, conversation.length - 12));
            speak(reply);
        } catch (error) {
            const message = error instanceof TypeError
                ? "No se pudo enviar el audio al asistente. Revisa la conexión e inténtalo de nuevo."
                : error instanceof Error
                    ? error.message
                    : "No se pudo procesar el audio. Intenta de nuevo.";
            response.textContent = message;
            speak(message);
        }
    };

    const stopRecording = () => {
        window.clearTimeout(recordingTimer);
        silenceStartedAt = 0;
        if (recorder?.state === "recording") {
            recorder.stop();
        }
    };

    const beginRecording = () => {
        if (!mediaStream || recorder || busy) {
            return;
        }

        const mimeType = AUDIO_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
        if (!mimeType && !MediaRecorder.isTypeSupported("")) {
            listening = false;
            updateMicButton();
            setStatus("Este navegador no puede grabar audio. Prueba Chrome o Edge actualizado.");
            return;
        }

        try {
            const currentRecorder = mimeType
                ? new MediaRecorder(mediaStream, { mimeType })
                : new MediaRecorder(mediaStream);
            const currentChunks = [];
            recorder = currentRecorder;
            currentRecorder.addEventListener("dataavailable", (event) => {
                if (event.data.size > 0) {
                    currentChunks.push(event.data);
                }
            });
            currentRecorder.addEventListener("stop", () => {
                if (recorder === currentRecorder) {
                    recorder = null;
                }
                window.clearTimeout(recordingTimer);

                const blob = new Blob(currentChunks, { type: currentRecorder.mimeType });
                if (discardedRecorders.has(currentRecorder) || !listening) {
                    return;
                }
                void handleRecording(blob);
            }, { once: true });
            currentRecorder.start();
            recordingStartedAt = performance.now();
            setStatus("Te escucho. Termina tu pregunta para que pueda responder.");
            recordingTimer = window.setTimeout(stopRecording, MAX_RECORDING_MS);
        } catch {
            recorder = null;
            listening = false;
            updateMicButton();
            setStatus("No se pudo grabar el audio. Revisa los permisos del micrófono e inténtalo de nuevo.");
        }
    };

    const monitorMicrophone = () => {
        if (!listening || !analyser) {
            return;
        }

        const samples = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(samples);
        let sumSquares = 0;
        for (const sample of samples) {
            const normalized = (sample - 128) / 128;
            sumSquares += normalized * normalized;
        }
        const volume = Math.sqrt(sumSquares / samples.length);
        const now = performance.now();

        if (!recorder && !busy) {
            noiseFloor = noiseFloor * 0.96 + Math.min(volume, 0.02) * 0.04;
            if (volume > Math.max(0.018, noiseFloor * 3)) {
                voiceFrames += 1;
                if (voiceFrames >= 3) {
                    beginRecording();
                }
            } else {
                voiceFrames = 0;
            }
        } else if (recorder?.state === "recording" && !busy) {
            if (volume > Math.max(0.014, noiseFloor * 2.4)) {
                silenceStartedAt = 0;
            } else if (!silenceStartedAt) {
                silenceStartedAt = now;
            } else if (now - silenceStartedAt >= SILENCE_DURATION_MS) {
                if (now - recordingStartedAt > 350) {
                    stopRecording();
                } else {
                    silenceStartedAt = 0;
                }
            }
        }

        monitorFrame = requestAnimationFrame(monitorMicrophone);
    };

    const releaseMicrophone = () => {
        window.cancelAnimationFrame(monitorFrame);
        window.clearTimeout(recordingTimer);
        if (recorder?.state === "recording") {
            discardedRecorders.add(recorder);
            recorder.stop();
        }
        recorder = null;
        mediaStream?.getTracks().forEach((track) => track.stop());
        mediaStream = null;
        if (audioContext && audioContext.state !== "closed") {
            void audioContext.close();
        }
        audioContext = null;
        analyser = null;
    };

    const startConversation = async () => {
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder !== "function") {
            setStatus("Este navegador no permite grabar desde el micrófono. Prueba Chrome o Edge actualizado.");
            return;
        }

        listening = true;
        updateMicButton();
        setStatus("Solicitando permiso para usar el micrófono...");

        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (!listening) {
                mediaStream.getTracks().forEach((track) => track.stop());
                mediaStream = null;
                return;
            }

            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                throw new Error("Este navegador no admite procesamiento de audio.");
            }
            audioContext = new AudioContextClass();
            await audioContext.resume();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            audioContext.createMediaStreamSource(mediaStream).connect(analyser);
            setStatus("Permiso concedido. Te escucho...");
            monitorMicrophone();
        } catch (error) {
            releaseMicrophone();
            listening = false;
            updateMicButton();
            setStatus(error instanceof DOMException && error.name === "NotAllowedError"
                ? "No se concedió permiso para el micrófono. Actívalo en el navegador y pulsa «Activar micrófono»."
                : error instanceof Error
                    ? error.message
                    : "No se pudo acceder al micrófono. Revisa los permisos del navegador.");
        }
    };

    micButton.addEventListener("click", () => {
        if (listening) {
            listening = false;
            releaseMicrophone();
            stopSpeaking();
            updateMicButton();
            setStatus("Micrófono pausado.");
            return;
        }
        void startConversation();
    });

    stopButton.addEventListener("click", () => {
        stopSpeaking();
        if (!busy) {
            setStatus(listening ? "Te escucho." : "Voz detenida.");
        }
    });

    void startConversation();
}
