import { Field, supportsWebGL } from "./field/scene";
import { setupMotion } from "./motion/scroll-timeline";
import { setupDemoPanel } from "./demo/panel";
import { setupTiltCards } from "./motion/tilt-card";
import { setupJourney } from "./motion/journey";
import { setupCtaLight } from "./motion/cta-light";
import { setupScenarioCount } from "./motion/scenario-count";
import { prefersReducedMotion } from "./motion/reduced-motion";

const reduced = prefersReducedMotion();
const canvas = document.getElementById("field-canvas") as HTMLCanvasElement;

let field: Field | null = null;

if (supportsWebGL()) {
  const isMobile = window.innerWidth < 760;
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

  field = new Field(canvas, { dpr });
  field.resize(window.innerWidth, window.innerHeight, dpr);

  window.addEventListener("resize", () => {
    const mobileNow = window.innerWidth < 760;
    const dprNow = Math.min(window.devicePixelRatio || 1, mobileNow ? 1.5 : 2);
    field?.resize(window.innerWidth, window.innerHeight, dprNow);
  });

  if (reduced) {
    field.render();
  } else {
    let running = true;
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) loop();
    });
    const loop = () => {
      if (!running) return;
      field?.render();
      requestAnimationFrame(loop);
    };
    loop();
  }
} else {
  document.body.classList.add("no-webgl");
}

setupMotion(field, reduced);
setupDemoPanel(field, reduced);
setupTiltCards(reduced);
setupJourney(reduced);
setupCtaLight(reduced);
setupScenarioCount(reduced);

if (import.meta.env.DEV) {
  (window as any).__viva_debug = { field, documentHidden: () => document.hidden };
}
