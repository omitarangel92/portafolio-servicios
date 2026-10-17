const PHONE = "573106598981", EMAIL = "omitarangel1992@gmail.com";

export function initContact() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const chips = form.querySelectorAll(".chip");
  chips.forEach((c) => c.addEventListener("click", () => c.classList.toggle("on")));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim() || "un visitante";
    const services = [...form.querySelectorAll(".chip.on")].map((c) => c.textContent).join(", ") || "tus servicios";
    const msg = form.msg.value.trim();
    const text = `¡Hola Omar! Soy ${name}. Me interesa: ${services}.${msg ? "\n\n" + msg : ""}`;
    const via = form.querySelector('input[name="via"]:checked').value;
    if (via === "wa") window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    else location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Proyecto: " + services)}&body=${encodeURIComponent(text)}`;
  });

  const copy = document.getElementById("copy-mail");
  copy?.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(EMAIL); } catch {}
    const s = copy.querySelector("span"), old = s.textContent;
    s.textContent = "¡Copiado!"; setTimeout(() => (s.textContent = old), 1600);
  });

  // Efecto magnético en los canales de contacto
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.2}px)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  });
}