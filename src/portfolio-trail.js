const STOPS = [
    {
        section: "about",
        host: ".section-title-center",
        question: "¿Qué estudié antes de Ingeniería de Sistemas?",
        answer: "Técnico en Diseño Gráfico Digital en Unitécnica, en Manizales."
    },
    {
        section: "services",
        host: ".section-title-center",
        question: "¿Qué tres áreas conecto en mi trabajo?",
        answer: "UX/UI, desarrollo Front-End y diseño gráfico e ilustración."
    },
    {
        section: "projects",
        host: ".section-title-center",
        question: "¿Qué proyecto convierte el ejercicio en una experiencia digital?",
        answer: "NEBUFIT30: una plataforma de rutinas fitness de 30 días."
    },
    {
        section: "designs",
        host: ".section-title-center",
        question: "¿Cuántas piezas creativas puedes explorar en mi galería?",
        answer: "23 piezas entre posts, logos e ilustraciones."
    },
    {
        section: "contact",
        host: ".contact-left > p",
        question: "¿Qué dos ciudades hacen parte de mi historia?",
        answer: "Soy de Manizales y actualmente vivo en Bogotá."
    }
];

export function initPortfolioTrail() {
    const startLink = document.getElementById("trail-start");
    if (!startLink) {
        return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cards = [];
    let discoveredCount = 0;
    let routeStarted = false;
    const supportsIntersectionObserver = "IntersectionObserver" in window;

    const scrollToStop = (index) => {
        const section = document.getElementById(STOPS[index].section);
        section?.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    };

    const updateActiveStop = (index) => {
        cards.forEach((card, cardIndex) => {
            card.classList.toggle("is-current", cardIndex === index);
        });
    };

    const updateProgress = () => {
        cards.forEach((card, index) => {
            const progressLabel = card.querySelector(".portfolio-trail-progress-label");
            const progressBar = card.querySelector(".portfolio-trail-progress");
            progressLabel.textContent = `Pista ${index + 1} de ${STOPS.length} · ${discoveredCount} descubiertas`;
            progressBar.value = discoveredCount;
        });
    };

    const discover = (stop, card, button, answer) => {
        answer.hidden = false;
        card.classList.add("is-solved");
        button.dataset.state = "next";

        if (!card.dataset.discovered) {
            card.dataset.discovered = "true";
            discoveredCount += 1;
            updateProgress();
        }

        if (stop === STOPS.length - 1) {
            button.textContent = "Ruta completada";
            button.disabled = true;
            return;
        }
        button.textContent = "Siguiente pista";
    };

    STOPS.forEach((stop, index) => {
        const section = document.getElementById(stop.section);
        const host = section?.querySelector(stop.host);
        if (!section || !host) {
            return;
        }

        const card = document.createElement("aside");
        card.className = "portfolio-trail-stop";
        card.hidden = true;

        const heading = document.createElement("h3");
        heading.className = "portfolio-trail-question";

        const number = document.createElement("span");
        number.className = "portfolio-trail-number";
        number.textContent = `PISTA ${String(index + 1).padStart(2, "0")}`;

        const question = document.createElement("span");
        question.textContent = stop.question;
        heading.append(number, question);

        const progressLabel = document.createElement("p");
        progressLabel.className = "portfolio-trail-progress-label";
        progressLabel.textContent = `Pista ${index + 1} de ${STOPS.length} · 0 descubiertas`;

        const progressBar = document.createElement("progress");
        progressBar.className = "portfolio-trail-progress";
        progressBar.max = STOPS.length;
        progressBar.value = 0;
        progressBar.setAttribute("aria-label", "Pistas descubiertas");

        const answer = document.createElement("p");
        answer.className = "portfolio-trail-answer";
        answer.hidden = true;
        answer.textContent = stop.answer;

        const actions = document.createElement("div");
        actions.className = "portfolio-trail-actions";

        const revealButton = document.createElement("button");
        revealButton.className = "portfolio-trail-button";
        revealButton.type = "button";
        revealButton.textContent = "Descubrir pista";
        revealButton.addEventListener("click", () => {
            if (revealButton.dataset.state === "next") {
                cards[index + 1].hidden = false;
                updateActiveStop(index + 1);
                scrollToStop(index + 1);
                return;
            }
            discover(index, card, revealButton, answer);
        });

        const exitButton = document.createElement("button");
        exitButton.className = "portfolio-trail-exit";
        exitButton.type = "button";
        exitButton.textContent = "Seguir sin la ruta";
        exitButton.addEventListener("click", () => {
            routeStarted = false;
            cards.forEach((item) => {
                item.hidden = true;
                item.classList.remove("is-current");
            });
            startLink.setAttribute("aria-pressed", "false");
            startLink.focus();
        });

        actions.append(revealButton, exitButton);
        card.append(heading, progressLabel, progressBar, answer, actions);
        host.insertAdjacentElement("afterend", card);
        cards.push(card);
    });

    if (cards.length !== STOPS.length) {
        return;
    }

    startLink.addEventListener("click", () => {
        if (routeStarted) {
            updateActiveStop(0);
            scrollToStop(0);
            return;
        }

        routeStarted = true;
        cards.forEach((card, index) => {
            card.hidden = supportsIntersectionObserver && index !== 0;
        });
        startLink.setAttribute("aria-pressed", "true");
        updateActiveStop(0);
        scrollToStop(0);
    });

    if (supportsIntersectionObserver) {
        const observer = new IntersectionObserver((entries) => {
            if (!routeStarted) {
                return;
            }
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = STOPS.findIndex((stop) => stop.section === entry.target.id);
                    if (index >= 0) {
                        cards[index].hidden = false;
                        updateActiveStop(index);
                    }
                }
            });
        }, { rootMargin: "-38% 0px -48% 0px", threshold: 0 });

        STOPS.forEach((stop) => observer.observe(document.getElementById(stop.section)));
    }
}
