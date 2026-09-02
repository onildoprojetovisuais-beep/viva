/** #cta-final — luz difusa que acompanha o cursor, reforçando a metáfora de
 * "revelar o que estava atrás do dado". Puramente decorativa (pointer-events:
 * none), só roda em desktop com ponteiro fino real e nunca com
 * prefers-reduced-motion — mesmo critério do tilt-card (ver
 * src/motion/tilt-card.ts). Sem GSAP: é uma posição direta por pointermove,
 * não uma animação contínua, então não há custo de rAF em repouso. */
export function setupCtaLight(reduced: boolean) {
  if (reduced) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const section = document.getElementById("cta-final");
  if (!section) return;

  const onMove = (event: PointerEvent) => {
    const rect = section.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * 100;
    const py = ((event.clientY - rect.top) / rect.height) * 100;
    section.style.setProperty("--cta-x", `${px}%`);
    section.style.setProperty("--cta-y", `${py}%`);
  };

  section.addEventListener("pointerenter", () => section.classList.add("is-glowing"));
  section.addEventListener("pointermove", onMove);
  section.addEventListener("pointerleave", () => section.classList.remove("is-glowing"));
}
