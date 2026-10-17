const SCENES = [
    { id: "about", label: "SOBRE MÍ" },
    { id: "services", label: "SERVICIOS" },
    { id: "why", label: "HERRAMIENTAS" },
    { id: "projects", label: "PROYECTOS" },
    { id: "designs", label: "DISEÑO" },
    { id: "contact", label: "CONTACTO" }
];

export function initScrollScenes() {
    const scenes = SCENES
        .map((scene) => ({ ...scene, element: document.getElementById(scene.id) }))
        .filter((scene) => scene.element);

    if (scenes.length === 0) {
        return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const navigation = document.createElement("nav");
    navigation.className = "scroll-scenes";
    navigation.setAttribute("aria-label", "Recorrido por el portafolio");
    navigation.hidden = true;

    const currentScene = document.createElement("span");
    currentScene.className = "scroll-scenes-current";
    currentScene.setAttribute("aria-live", "polite");
    currentScene.setAttribute("aria-atomic", "true");

    const steps = document.createElement("div");
    steps.className = "scroll-scenes-steps";

    const progress = document.createElement("span");
    progress.className = "scroll-scenes-progress";
    progress.setAttribute("aria-hidden", "true");
    steps.append(progress);

    const buttons = scenes.map((scene, index) => {
        scene.element.classList.add("scroll-scene-section");
        const button = document.createElement("button");
        button.className = "scroll-scenes-step";
        button.type = "button";
        button.setAttribute("aria-label", `Ir a ${scene.label.toLowerCase()}`);
        button.textContent = String(index + 1).padStart(2, "0");
        button.addEventListener("click", () => {
            scene.element.scrollIntoView({
                behavior: reduceMotion.matches ? "auto" : "smooth",
                block: "start"
            });
        });
        steps.append(button);
        return button;
    });

    navigation.append(currentScene, steps);
    document.body.append(navigation);

    let activeIndex = -1;
    let scheduled = false;

    const updateScene = () => {
        scheduled = false;
        const marker = window.innerHeight * 0.52;
        let nextIndex = -1;

        scenes.forEach((scene, index) => {
            if (scene.element.getBoundingClientRect().top <= marker) {
                nextIndex = index;
            }
        });

        navigation.hidden = nextIndex < 0;
        if (nextIndex < 0 || nextIndex === activeIndex) {
            return;
        }

        if (activeIndex >= 0) {
            scenes[activeIndex].element.classList.remove("scroll-scene-active");
        }

        activeIndex = nextIndex;
        scenes[activeIndex].element.classList.add("scroll-scene-active");
        currentScene.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${scenes[activeIndex].label}`;
        buttons.forEach((button, index) => {
            if (index === activeIndex) {
                button.setAttribute("aria-current", "step");
            } else {
                button.removeAttribute("aria-current");
            }
        });
        steps.style.setProperty("--scene-progress", `${activeIndex / Math.max(scenes.length - 1, 1)}`);
    };

    const scheduleUpdate = () => {
        if (!scheduled) {
            scheduled = true;
            window.requestAnimationFrame(updateScene);
        }
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();
}
