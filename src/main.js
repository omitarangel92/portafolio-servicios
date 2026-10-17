import { initThreeBackground } from "./three-background.js";
import { initAnimations } from "./animations.js";
import { initProjects } from "./projects-carousel.js";
import { initContact } from "./contact.js";
import { initTheme } from "./theme.js";
import { initTools, initDesigns } from "./sections.js";
import { initInteractiveAvatar } from "./ai-avatar.js";
import { initPortfolioTrail } from "./portfolio-trail.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initThreeBackground();
  initProjects();
  initContact();
  initTools();
  initDesigns();
  initAnimations();
  initInteractiveAvatar();
  initPortfolioTrail();
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
