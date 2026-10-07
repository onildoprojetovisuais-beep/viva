import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Field } from "../field/scene";

gsap.registerPlugin(ScrollTrigger);

if (import.meta.env.DEV) {
  (window as any).__viva_ScrollTrigger = ScrollTrigger;
  (window as any).__viva_gsap = gsap;
}

/** Envolve cada palavra em um span, preservando o texto original (só fragmentação visual). */
function splitWords(el: Element): HTMLSpanElement[] {
  const text = el.textContent ?? "";
  el.textContent = "";
  const words = text.split(" ");
  const spans: HTMLSpanElement[] = [];
  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.className = "split-word";
    span.textContent = word;
    el.appendChild(span);
    spans.push(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
  });
  el.classList.add("is-split");
  return spans;
}

/** Dentro de um [data-reveal-group] (pilares, grade de demonstração, jornada,
 * indicadores de evidência), cada filho direto marcado com [data-reveal] ganha
 * um pequeno atraso incremental — a mesma revelação individual do resto do
 * site, só que em cascata, para o grupo entrar como sequência e não em bloco. */
function applyGroupStagger() {
  document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
    const items = Array.from(group.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el.hasAttribute("data-reveal")
    );
    items.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.08}s`;
    });
  });
}

export function setupMotion(field: Field | null, reduced: boolean) {
  applyGroupStagger();

  const revealEls = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  const splitEls = Array.from(document.querySelectorAll<HTMLElement>("[data-split]"));
  const splitWordsByEl = splitEls.map((el) => splitWords(el));

  if (reduced) {
    // Sem motion: todo conteúdo nasce visível, campo fica numa pose estática representativa
    // (Impacto — a leitura mais resolvida sem a complexidade extra dos ramos de Decisão).
    revealEls.forEach((el) => el.classList.add("is-visible"));
    splitWordsByEl.flat().forEach((span) => {
      span.style.opacity = "1";
      span.style.transform = "none";
    });
    field?.setProgress(2);
    field?.setCoreBoost(0);
    return;
  }

  revealEls.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => el.classList.add("is-visible"),
      onEnterBack: () => el.classList.add("is-visible"),
    });
  });

  splitEls.forEach((el, i) => {
    const words = splitWordsByEl[i];
    // Estado inicial INLINE: a regra CSS `[data-split].is-split .split-word` deixa
    // as palavras visíveis assim que o split acontece (vence `.split-word` por
    // especificidade), o que anulava a entrada. Inline style vence o CSS.
    // Blur → nítido: "a leitura emergindo" (REF-007/REF-009 da Stack), sem bounce.
    gsap.set(words, { opacity: 0, yPercent: 70, filter: "blur(8px)" });

    // revelação atmosférica e contida — restrição deliberada, não pressa (nunca springs/bounce)
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(words, {
          opacity: 1,
          yPercent: 0,
          filter: "blur(0px)",
          duration: 1.3,
          ease: "sine.inOut", // ≈ --ease-atmosphere (.45,.03,.52,.96); GSAP não lê string cubic-bezier sem CustomEase
          stagger: 0.045,
          clearProps: "filter",
        }),
    });
  });

  if (!field) return;

  // Transformação: campo migra de Dado (0) para Leitura (1) — clusters começam a se formar.
  ScrollTrigger.create({
    trigger: "#transformacao",
    start: "top bottom",
    end: "bottom top",
    scrub: 1,
    onUpdate: (self) => field.setProgress(self.progress),
  });

  // Demonstração Visual: pin + progresso do campo (Leitura → Impacto → Decisão) e a
  // coreografia dos 4 cards de dataviz agora vivem em src/demo/panel.ts — a seção
  // ficou complexa demais para caber neste arquivo genérico de reveals.

  // CTA Final: o núcleo se acende gradualmente conforme o usuário rola pela seção —
  // não é mais um pulso disparado uma vez, é o próprio gesto de rolar que "revela"
  // o que estava atrás do dado. scrub bem alto (2.4) para a resposta ficar
  // deliberadamente atrasada/lenta, nunca 1:1 com o scroll.
  ScrollTrigger.create({
    trigger: "#cta-final",
    start: "top 90%",
    end: "bottom 65%",
    scrub: 2.4,
    onUpdate: (self) => field.setCoreBoost(self.progress * 0.55),
  });
}
