// Modo día / noche: guarda la preferencia y avisa a los demás módulos
export function initTheme() {
  const root = document.documentElement, btn = document.getElementById("theme-toggle");
  const apply = (t) => {
    root.dataset.theme = t;
    try { localStorage.setItem("theme", t); } catch {}
    window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
  };
  btn?.addEventListener("click", () => apply(root.dataset.theme === "light" ? "dark" : "light"));
}