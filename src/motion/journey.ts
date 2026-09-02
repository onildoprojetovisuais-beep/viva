import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CAPTION_SWAP_MS = 220;
const MOBILE_QUERY = "(max-width: 640px)";

/** Jornada:
 * — Desktop (≥641px, régua horizontal numa linha só): um único passo por vez
 *   acende conforme o scroll atravessa a seção inteira, e uma legenda
 *   compartilhada troca de texto para descrever o passo em foco.
 * — Mobile (≤640px, lista vertical): cada passo já mostra sua própria
 *   microdescrição; o trilho fino preenche em contínuo (scrub) e, no mesmo
 *   onUpdate, o passo cujo centro está mais próximo do centro da viewport
 *   acende — uma leitura, não um listener de scroll à parte.
 * Em ambos: ao focar "Nova leitura", a classe `is-looping` no container
 * dispara a microanimação de retorno ao primeiro passo. */
export function setupJourney(reduced: boolean) {
  const section = document.getElementById("jornada");
  const journey = section?.querySelector<HTMLElement>("[data-journey]");
  const caption = section?.querySelector<HTMLElement>("[data-journey-caption]");
  const railFill = section?.querySelector<HTMLElement>("[data-journey-rail-fill]");
  const stepsList = section?.querySelector<HTMLElement>(".journey__steps");
  const steps = Array.from(section?.querySelectorAll<HTMLElement>(".journey__step") ?? []);
  if (!section || !journey || !caption || !stepsList || !steps.length) return;

  const lastIndex = steps.length - 1;
  const descriptions = steps.map((step) => step.dataset.desc ?? "");

  let looped = false;
  const setLooping = (isLast: boolean) => {
    if (isLast && !looped) {
      looped = true;
      journey.classList.add("is-looping");
    } else if (!isLast && looped) {
      looped = false;
      journey.classList.remove("is-looping");
    }
  };

  if (reduced) {
    steps.forEach((step, i) => step.classList.toggle("is-active", i === lastIndex));
    caption.textContent = descriptions[lastIndex];
    caption.classList.add("is-visible");
    if (railFill) railFill.style.transform = "scaleY(1)";
    return;
  }

  if (window.matchMedia(MOBILE_QUERY).matches) {
    ScrollTrigger.create({
      trigger: stepsList,
      start: "top center",
      end: "bottom center",
      scrub: .6,
      onUpdate: (self) => {
        if (railFill) railFill.style.transform = `scaleY(${self.progress})`;

        const viewportCenter = window.innerHeight / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;
        steps.forEach((step, i) => {
          const rect = step.getBoundingClientRect();
          const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
          }
        });
        steps.forEach((step, i) => step.classList.toggle("is-active", i === closestIndex));
        setLooping(closestIndex === lastIndex);
      },
    });
    return;
  }

  let currentIndex = -1;
  let swapTimer: number | undefined;

  const setCaptionText = (text: string) => {
    caption.textContent = text;
    caption.classList.add("is-visible");
  };

  ScrollTrigger.create({
    trigger: section,
    start: "top 80%",
    end: "bottom 55%",
    scrub: .6,
    onUpdate: (self) => {
      const index = Math.min(lastIndex, Math.floor(self.progress * steps.length));
      if (index === currentIndex) return;
      currentIndex = index;

      steps.forEach((step, i) => step.classList.toggle("is-active", i === currentIndex));

      window.clearTimeout(swapTimer);
      caption.classList.remove("is-visible");
      swapTimer = window.setTimeout(() => setCaptionText(descriptions[currentIndex]), CAPTION_SWAP_MS);

      setLooping(currentIndex === lastIndex);
    },
  });
}
