import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP = "(min-width: 860px)";

/**
 * Coreografia de scroll das partes que eram estáticas. Tudo aqui é scrub em
 * transform/opacity/clip-path (nada de layout), anima CONTAINERS ou filhos que
 * não têm [data-reveal] — os reveals por classe CSS continuam donos dos seus
 * próprios elementos, sem dois sistemas brigando pela mesma propriedade.
 *
 * Fora de escopo de propósito: #prova (outro dono), os cards da demonstração
 * (o tilt já usa `y`/rotation neles) e o canvas (o progresso do campo já é
 * pilotado por scroll-timeline.ts / demo/panel.ts).
 *
 * prefers-reduced-motion: nada é registrado — o layout já nasce no estado final.
 */
export function setupScrollChoreography(reduced: boolean) {
  if (reduced) return;

  heroExit();
  problemaMedia();
  pillarReading();
  ctaArrival();

  const mm = gsap.matchMedia();
  mm.add(DESKTOP, () => {
    sectionRise("#problema");
    sectionRise("#agencia");
    agenciaDepth();
  });

  // a imagem de #problema é lazy e muda a altura do documento quando chega —
  // recalcula start/end de todos os triggers depois dela (e das fontes).
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/** Hero: ao sair, o bloco de texto sobe um pouco mais devagar que o scroll e
 * dissolve — o leitor "atravessa" a primeira frase em vez de empurrá-la. */
function heroExit() {
  const inner = document.querySelector<HTMLElement>("#hero .stage__inner");
  if (!inner) return;
  gsap.to(inner, {
    yPercent: -14,
    opacity: 0.12,
    ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 0.6 },
  });
}

/** Problema: a imagem abre de uma moldura recortada para o quadro inteiro
 * enquanto a foto desacelera dentro dela (parallax interno) — o dado "entra em
 * foco" junto com a pergunta da seção. clip-path no wrapper funciona como
 * máscara, então o scale da imagem nunca vaza. */
function problemaMedia() {
  const media = document.querySelector<HTMLElement>("#problema .stage__media");
  const img = media?.querySelector<HTMLImageElement>("img");
  if (!media || !img) return;

  gsap.fromTo(
    media,
    { clipPath: "inset(9% 7% 9% 7% round 20px)" },
    {
      clipPath: "inset(0% 0% 0% 0% round 20px)",
      ease: "none",
      scrollTrigger: { trigger: media, start: "top 92%", end: "center 55%", scrub: 0.8 },
    }
  );
  gsap.fromTo(
    img,
    { scale: 1.16, yPercent: -4 },
    {
      scale: 1.02,
      yPercent: 4,
      ease: "none",
      scrollTrigger: { trigger: "#problema", start: "top bottom", end: "bottom top", scrub: 0.8 },
    }
  );
}

/** Transformação: cada pilar acende conforme cruza a faixa de leitura da
 * viewport — índice desliza para o lugar, nome e descrição saem de um tom
 * apagado. É a própria "leitura" acontecendo no gesto de rolar. Os <li> têm
 * [data-reveal] (opacity via CSS), então só os filhos são animados. */
function pillarReading() {
  const items = gsap.utils.toArray<HTMLElement>("#transformacao .pillar-list__item");
  items.forEach((item) => {
    const index = item.querySelector(".pillar-list__index");
    const name = item.querySelector(".pillar-list__name");
    const desc = item.querySelector(".pillar-list__desc");

    const tl = gsap.timeline({
      scrollTrigger: { trigger: item, start: "top 88%", end: "top 52%", scrub: 0.6 },
      defaults: { ease: "none" },
    });
    if (index) tl.fromTo(index, { x: -18, opacity: 0.2 }, { x: 0, opacity: 1 }, 0);
    if (name) tl.fromTo(name, { opacity: 0.28 }, { opacity: 1 }, 0.1);
    if (desc) tl.fromTo(desc, { opacity: 0.15 }, { opacity: 1 }, 0.25);
  });
}

/** CTA final: o bloco chega um pouco "de baixo" e assenta no centro conforme a
 * seção entra — acompanha o acendimento do núcleo do campo (coreBoost). */
function ctaArrival() {
  const inner = document.querySelector<HTMLElement>("#cta-final .stage__inner--cta");
  if (!inner) return;
  gsap.fromTo(
    inner,
    { y: 70 },
    {
      y: 0,
      ease: "none",
      scrollTrigger: { trigger: "#cta-final", start: "top bottom", end: "top 25%", scrub: 0.8 },
    }
  );
}

/** Transição entre estágios: seções de fundo sólido sobem como uma lâmina com
 * cantos arredondados e laterais recolhidas, abrindo para full-bleed ao chegar
 * — o corte seco entre campo e fundo opaco vira uma passagem. Só desktop: no
 * mobile a margem lateral já é mínima e o efeito viraria ruído. */
function sectionRise(selector: string) {
  const section = document.querySelector<HTMLElement>(selector);
  if (!section) return;
  gsap.fromTo(
    section,
    { clipPath: "inset(0% 3.5% 0% 3.5% round 28px)" },
    {
      clipPath: "inset(0% 0% 0% 0% round 0px)",
      ease: "none",
      scrollTrigger: { trigger: section, start: "top bottom", end: "top 35%", scrub: 0.6 },
    }
  );
}

/** Agência: profundidade sutil entre as colunas — a lista de cenários corre um
 * pouco mais rápido que a frase-manifesto, que fica como âncora. */
function agenciaDepth() {
  const list = document.querySelector<HTMLElement>("#agencia .scenario-list");
  if (!list) return;
  gsap.fromTo(
    list,
    { y: 60 },
    {
      y: -40,
      ease: "none",
      scrollTrigger: { trigger: "#agencia", start: "top bottom", end: "bottom top", scrub: 0.8 },
    }
  );
}
