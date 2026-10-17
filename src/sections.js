import { gsap } from "gsap";

// Pestañas "¿Por qué trabajar conmigo?" + logos de herramientas
export function initTools() {
  const tabs = document.querySelectorAll(".why-tabs button"), panels = document.querySelectorAll(".why-panel");
  tabs.forEach((b) => b.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.toggle("on", t === b));
    panels.forEach((p) => p.classList.toggle("on", p.id === "tab-" + b.dataset.tab));
    gsap.fromTo(`#tab-${b.dataset.tab} > *, #tab-${b.dataset.tab} .icons-img`, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power3.out" });
  }));
}

// Carrusel de diseños (scroll-snap + flechas)
export function initDesigns() {
  const track = document.getElementById("ds-track");
  if (!track) return;
  const step = () => track.clientWidth * 0.8;
  document.getElementById("ds-prev").onclick = () => track.scrollBy({ left: -step(), behavior: "smooth" });
  document.getElementById("ds-next").onclick = () => {
    const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    end ? track.scrollTo({ left: 0, behavior: "smooth" }) : track.scrollBy({ left: step(), behavior: "smooth" });
  };
  // Arrastre con mouse
  let down = false, sx = 0, sl = 0;
  track.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse") { down = true; sx = e.clientX; sl = track.scrollLeft; } });
  window.addEventListener("pointerup", () => (down = false));
  track.addEventListener("pointermove", (e) => { if (down) track.scrollLeft = sl - (e.clientX - sx); });
}