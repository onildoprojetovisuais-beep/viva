import gsap from "gsap";

/**
 * Tilt 3D sutil + reflexo que segue o cursor, para qualquer elemento marcado
 * com [data-tilt-card] (os 4 cards da seção de demonstração).
 * Só roda em desktop com hover/ponteiro fino real — touch nunca aciona — e
 * nunca em prefers-reduced-motion, mesmo princípio do resto do motion do site
 * (ver src/motion/reduced-motion.ts): o layout já nasce correto sem o efeito.
 */
export function setupTiltCards(reduced: boolean) {
  if (reduced) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-tilt-card]"));
  if (!cards.length) return;

  cards.forEach((card) => {
    const setRotateX = gsap.quickTo(card, "rotationX", { duration: .6, ease: "power3.out" });
    const setRotateY = gsap.quickTo(card, "rotationY", { duration: .6, ease: "power3.out" });
    const setLift = gsap.quickTo(card, "y", { duration: .6, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      setRotateY((px - .5) * 9);
      setRotateX((.5 - py) * 7);
      setLift(-6);

      card.style.setProperty("--spot-x", `${px * 100}%`);
      card.style.setProperty("--spot-y", `${py * 100}%`);
    };

    const onLeave = () => {
      setRotateX(0);
      setRotateY(0);
      setLift(0);
    };

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
  });
}
