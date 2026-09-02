import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Field } from "../field/scene";

gsap.registerPlugin(ScrollTrigger);

interface CountOpts {
  target: number;
  decimals: number;
  prefix: string;
  suffix: string;
  int: boolean;
}

function readCountOpts(el: HTMLElement): CountOpts {
  return {
    target: parseFloat(el.dataset.countTo ?? "0"),
    decimals: parseInt(el.dataset.decimals ?? "0", 10),
    prefix: el.dataset.prefix ?? "",
    suffix: el.dataset.suffix ?? "",
    int: el.hasAttribute("data-count-int"),
  };
}

function formatValue(value: number, opts: Omit<CountOpts, "target">): string {
  const body = opts.int
    ? Math.round(value).toLocaleString("pt-BR")
    : value.toLocaleString("pt-BR", { minimumFractionDigits: opts.decimals, maximumFractionDigits: opts.decimals });
  return opts.prefix + body + opts.suffix;
}

function countUp(el: HTMLElement, duration = 1.3, delay = 0) {
  const opts = readCountOpts(el);
  const proxy = { v: 0 };
  gsap.to(proxy, {
    v: opts.target,
    duration,
    delay,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = formatValue(proxy.v, opts);
    },
  });
}

function setFinalText(el: HTMLElement) {
  const opts = readCountOpts(el);
  el.textContent = formatValue(opts.target, opts);
}

const LINE_DASH = 620; // maior que o comprimento real do path — só precisa cobrir o desenho inteiro
const RING_RADIUS = 78;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** 01 Identifica — linha desenhada + área revelada + pontos entrando em sequência. */
function animateCard0(card: HTMLElement) {
  const line = card.querySelector<SVGPathElement>("[data-line-path]");
  const area = card.querySelector<SVGPathElement>("[data-area-path]");
  const dots = Array.from(card.querySelectorAll<SVGCircleElement>("[data-line-dot]"));
  const values = Array.from(card.querySelectorAll<HTMLElement>("[data-count-to]"));

  if (line) {
    gsap.fromTo(
      line,
      { attr: { "stroke-dasharray": LINE_DASH, "stroke-dashoffset": LINE_DASH } },
      { attr: { "stroke-dashoffset": 0 }, duration: 1.3, ease: "power2.out" }
    );
  }
  if (area) gsap.fromTo(area, { opacity: 0 }, { opacity: 1, duration: .9, delay: .35 });
  if (dots.length) {
    gsap.fromTo(
      dots,
      { scale: 0, opacity: 0, transformOrigin: "center" },
      { scale: 1, opacity: 1, duration: .4, stagger: .08, delay: 1 }
    );
  }
  values.forEach((el) => countUp(el, 1.4));
}

/** 02 Contextualiza — coluna de benchmark cresce até a referência real de R$50. */
function animateCard1(card: HTMLElement) {
  const fill = card.querySelector<SVGRectElement>("[data-bench-fill]");
  const cap = card.querySelector<SVGRectElement>("[data-bench-cap]");
  const values = Array.from(card.querySelectorAll<HTMLElement>("[data-count-to]"));

  if (fill) {
    const finalY = parseFloat(fill.dataset.finalY ?? "0");
    const finalHeight = parseFloat(fill.dataset.finalHeight ?? "0");
    const hiddenY = parseFloat(fill.dataset.hiddenY ?? "0");
    gsap.fromTo(fill, { attr: { y: hiddenY, height: 0 } }, { attr: { y: finalY, height: finalHeight }, duration: 1.2, ease: "power2.out" });
  }
  if (cap) {
    const finalY = parseFloat(cap.dataset.finalY ?? "0");
    const hiddenY = parseFloat(cap.dataset.hiddenY ?? "0");
    gsap.fromTo(cap, { attr: { y: hiddenY } }, { attr: { y: finalY }, duration: 1.2, ease: "power2.out" });
  }
  values.forEach((el) => countUp(el, 1.2));
}

/** 03 Compara — as duas barras crescem (referência primeiro), depois o delta aparece. */
function animateCard2(card: HTMLElement) {
  const fills = Array.from(card.querySelectorAll<HTMLElement>("[data-compare-fill]"));
  const values = Array.from(card.querySelectorAll<HTMLElement>("[data-count-to]"));

  fills.forEach((el, i) => {
    const target = parseFloat(el.dataset.finalWidth ?? "0");
    gsap.fromTo(el, { width: "0%" }, { width: `${target}%`, duration: 1, ease: "power2.out", delay: i * .25 });
  });
  values.forEach((el, i) => countUp(el, 1.1, i < 2 ? i * .25 : .9));
}

/** 04 Revela — o anel de impacto se desenha por completo, número e badge fecham a sequência. */
function animateCard3(card: HTMLElement) {
  const ring = card.querySelector<SVGCircleElement>("[data-ring-fill]");
  const values = Array.from(card.querySelectorAll<HTMLElement>("[data-count-to]"));

  if (ring) {
    gsap.fromTo(
      ring,
      { attr: { "stroke-dasharray": RING_CIRCUMFERENCE, "stroke-dashoffset": RING_CIRCUMFERENCE } },
      { attr: { "stroke-dashoffset": 0 }, duration: 1.6, ease: "power3.out" }
    );
  }
  values.forEach((el) => countUp(el, 1.5, .3));
}

const CARD_ANIMATORS = [animateCard0, animateCard1, animateCard2, animateCard3];

function setFinalState(section: HTMLElement) {
  // sem motion: nada precisa ser animado — a marcação já nasce com os valores/traços
  // finais reais (ver comentários no HTML); só os contadores textuais viram texto direto.
  Array.from(section.querySelectorAll<HTMLElement>("[data-count-to]")).forEach(setFinalText);
}

/** Pausa TODO o motion ambiente (CSS, via a classe) quando a seção sai do viewport
 * ou a aba perde visibilidade — nenhum loop roda escondido, sem custo de rAF. */
function setupAmbientGate(section: HTMLElement) {
  let inView = false;

  const sync = () => {
    section.classList.toggle("is-ambient-active", inView && document.visibilityState === "visible");
  };

  const observer = new IntersectionObserver(
    (entries) => {
      inView = entries[0]?.isIntersecting ?? false;
      sync();
    },
    { threshold: .15 }
  );
  observer.observe(section);

  document.addEventListener("visibilitychange", sync);
}

export function setupDemoPanel(field: Field | null, reduced: boolean) {
  const section = document.getElementById("demonstracao");
  const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-demo-card]"));
  if (!section || !cards.length) return;

  if (reduced) {
    setFinalState(section);
    return;
  }

  setupAmbientGate(section);

  // Sem pin: a seção é alta de propósito (respiro entre os cards é o ponto), então
  // nada aqui trava o scroll — cada card ativa sua própria entrada ao chegar no
  // viewport, como o resto do site já faz para blocos de conteúdo empilhados.
  cards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      start: "top 82%",
      once: true,
      onEnter: () => CARD_ANIMATORS[index]?.(card),
    });
  });

  if (field) {
    // O campo continua migrando Leitura → Impacto → Decisão ao longo de toda a
    // seção (agora bem mais longa) — só que sem pin, é um scrub comum como o de
    // #transformacao.
    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => field.setProgress(1 + self.progress * 2),
    });
  }
}
