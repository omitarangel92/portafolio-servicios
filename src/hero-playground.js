export function initHeroPlayground() {
    const playground = document.getElementById("hero-playground");
    const avatar = document.getElementById("talking-avatar-card");
    if (
        !playground ||
        !avatar ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
        return;
    }

    const portrait = playground.querySelector(".avatar-portrait");
    const nodes = [...playground.querySelectorAll(".hero-orbit-node")];
    let frame = 0;
    let pointerPosition;

    const reset = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        playground.classList.remove("is-pointer-active");
        avatar.style.removeProperty("--tilt-x");
        avatar.style.removeProperty("--tilt-y");
        nodes.forEach((node) => {
            node.style.removeProperty("--shift-x");
            node.style.removeProperty("--shift-y");
        });
    };

    playground.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") {
            return;
        }

        pointerPosition = { x: event.clientX, y: event.clientY };
        if (frame) {
            return;
        }

        frame = requestAnimationFrame(() => {
            frame = 0;
            const bounds = playground.getBoundingClientRect();
            const x = (pointerPosition.x - bounds.left) / bounds.width * 2 - 1;
            const y = (pointerPosition.y - bounds.top) / bounds.height * 2 - 1;

            avatar.style.setProperty("--tilt-x", `${-y * 4}deg`);
            avatar.style.setProperty("--tilt-y", `${x * 5}deg`);

            const portraitBounds = portrait.getBoundingClientRect();
            const lightX = Math.max(0, Math.min(100, (pointerPosition.x - portraitBounds.left) / portraitBounds.width * 100));
            const lightY = Math.max(0, Math.min(100, (pointerPosition.y - portraitBounds.top) / portraitBounds.height * 100));
            playground.style.setProperty("--light-x", `${lightX}%`);
            playground.style.setProperty("--light-y", `${lightY}%`);
            playground.classList.add("is-pointer-active");

            nodes.forEach((node, index) => {
                const depth = (index + 1) * 11;
                node.style.setProperty("--shift-x", `${x * depth}px`);
                node.style.setProperty("--shift-y", `${y * depth}px`);
            });
        });
    });

    playground.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
}
