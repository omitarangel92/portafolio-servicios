import { gsap } from "gsap";
import { projects } from "./projects-data.js";

export function initProjects() {
  const stage = document.getElementById("cf-stage");
  if (!stage) return;
  const tabs = document.getElementById("pj-tabs"), bar = document.getElementById("pj-bar");
  const $ = (id) => document.getElementById(id);
  let cur = 0;

  const cover = (p) => p.image
    ? `<img src="${p.image}" alt="${p.title}" draggable="false">`
    : `<div class="cf-ph"><i class="fas ${p.icon}"></i></div>`;

  const host = (p) => { try { return new URL(p.url).host; } catch { return "próximamente"; } };
  stage.innerHTML = projects.map((p, i) =>
    `<div class="cf-item" data-i="${i}"><div class="cf-inner"><div class="mk-bar"><i></i><i></i><i></i><span>${host(p)}</span></div><div class="mk-body">${cover(p)}</div></div></div>`).join("");
  tabs.innerHTML = projects.map((p, i) => `<button data-i="${i}">${String(i + 1).padStart(2, "0")}<small>${p.title}</small></button>`).join("");
  const items = [...stage.children], btns = [...tabs.children];

  function layout() {
    const n = projects.length, narrow = stage.clientWidth < 420;
    items.forEach((el, i) => {
      let o = i - cur; if (o > n / 2) o -= n; if (o < -n / 2) o += n; // carrusel circular
      const a = Math.abs(o);
      gsap.to(el, { x: o * (narrow ? 52 : 60) + "%", z: -a * 150, rotationY: -o * 38, scale: 1 - a * 0.08,
        opacity: a > 2 ? 0 : 1 - a * 0.28, duration: 0.8, ease: "power3.out", overwrite: true });
      el.style.zIndex = 10 - a; el.classList.toggle("active", o === 0);
      el.style.pointerEvents = a > 2 ? "none" : "auto";
    });
  }

  function fill(animate) {
    const p = projects[cur];
    const set = () => {
      $("pj-count").textContent = `${String(cur + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
      $("pj-tag").textContent = p.tag; $("pj-title").textContent = p.title;
      $("pj-problem").textContent = p.problem; $("pj-solution").textContent = p.solution; $("pj-result").textContent = p.result;
      $("pj-tools").innerHTML = p.tools.map((t) => `<span>${t}</span>`).join("");
      const a = $("pj-link");
      a.href = p.url || "#"; a.classList.toggle("disabled", !p.url);
      a.innerHTML = p.url ? 'Ver trabajo en vivo <i class="fas fa-arrow-up-right-from-square"></i>' : 'Próximamente <i class="fas fa-hourglass-half"></i>';
    };
    if (!animate) return set();
    gsap.timeline().to(".pj-fade", { y: -14, opacity: 0, duration: 0.2, stagger: 0.03 })
      .add(set)
      .fromTo(".pj-fade", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.09, ease: "power3.out" });
  }

  function go(i, animate = true) {
    const n = projects.length; cur = (i + n) % n;
    btns.forEach((b, k) => b.classList.toggle("on", k === cur));
    gsap.to(bar, { width: ((cur + 1) / n) * 100 + "%", duration: 0.6, ease: "power3.out" });
    layout(); fill(animate);
  }

  stage.addEventListener("click", (e) => {
    if (moved) return;
    const el = e.target.closest(".cf-item"); if (!el) return;
    const i = +el.dataset.i;
    if (i !== cur) return go(i);
    const u = projects[i].url; if (u) window.open(u, "_blank", "noopener");
  });
  tabs.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) go(+b.dataset.i); });
  $("pj-prev").onclick = () => go(cur - 1);
  $("pj-next").onclick = () => go(cur + 1);
  document.getElementById("pj-link").addEventListener("click", (e) => { if (!projects[cur].url) e.preventDefault(); });

  // Arrastre / swipe
  let sx = 0, down = false, moved = false;
  stage.addEventListener("pointerdown", (e) => { down = true; moved = false; sx = e.clientX; });
  window.addEventListener("pointerup", (e) => {
    if (!down) return; down = false;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 50) { moved = true; go(cur + (dx < 0 ? 1 : -1)); setTimeout(() => (moved = false), 50); }
  });
  window.addEventListener("keydown", (e) => {
    const r = stage.getBoundingClientRect();
    if (r.top > innerHeight || r.bottom < 0) return;
    if (e.key === "ArrowRight") go(cur + 1); if (e.key === "ArrowLeft") go(cur - 1);
  });

  // Inclinación 3D de la tarjeta activa según el mouse
  stage.addEventListener("mousemove", (e) => {
    const el = stage.querySelector(".active .cf-inner"); if (!el) return;
    const r = el.getBoundingClientRect();
    gsap.to(el, { rotationX: -((e.clientY - r.top) / r.height - 0.5) * 14, rotationY: ((e.clientX - r.left) / r.width - 0.5) * 14, duration: 0.4 });
  });
  stage.addEventListener("mouseleave", () => gsap.to(".cf-inner", { rotationX: 0, rotationY: 0, duration: 0.6 }));
  window.addEventListener("resize", layout);

  gsap.set(items, { x: "0%", z: -400, opacity: 0 });
  go(0, false);
}