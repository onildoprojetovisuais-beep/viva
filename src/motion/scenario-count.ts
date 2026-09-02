import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Indicadores dos cenários (#agencia, MANTER/AMPLIAR/REVISAR) — contagem
 * discreta de 0 até o valor final quando o número entra na viewport. Só
 * mobile, onde o percentual vira protagonista visual grande o bastante para
 * a contagem valer a pena (no desktop o número já nasce pequeno e estático).
 * Nunca com prefers-reduced-motion: o valor final já está no HTML, então
 * pular a animação não perde nenhuma informação. */
export function setupScenarioCount(reduced: boolean) {
  if (reduced) return;
  if (!window.matchMedia("(max-width: 640px)").matches) return;

  const values = Array.from(document.querySelectorAll<HTMLElement>(".scenario__delta-value"));
  if (!values.length) return;

  values.forEach((el) => {
    const target = parseFloat(el.dataset.countTo ?? "0");
    const suffix = el.dataset.suffix ?? "";
    const proxy = { v: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(proxy, {
          v: target,
          duration: 1.1,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = `${Math.round(proxy.v)}${suffix}`;
          },
        });
      },
    });
  });
}
