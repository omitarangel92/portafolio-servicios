import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  gsap.from(".hero-reveal", { duration: 1.2, y: 80, opacity: 0, stagger: 0.2, ease: "power4.out" });

  gsap.utils.toArray(".glass-card, .timeline-card, .reveal").forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
      y: 40, opacity: 0, duration: 0.7, ease: "power3.out"
    });
  });

  // Entrada del carrusel 3D de proyectos
  gsap.from(".cf-stage", {
    scrollTrigger: { trigger: "#projects", start: "top 60%" },
    rotationX: 25, y: 60, opacity: 0, duration: 1.2, ease: "power3.out"
  });
}