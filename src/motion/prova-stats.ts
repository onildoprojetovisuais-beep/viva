import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** #prova — indicadores "8 anos" e "30+ clientes ativos" como herói visual.
 *
 * - 8 anos: 8 barras em escada (acúmulo) que preenchem uma a uma, em sincronia
 *   com a contagem 0→8.
 * - 30+: constelação de 30 nós que acendem a partir de um ponto de origem
 *   (rede se espalhando) em sincronia com a contagem 0→30; ao fechar a conta o
 *   "+" entra com impacto (onda de choque) e a rede segue pulsando enquanto a
 *   seção está na viewport.
 *
 * O valor final está sempre no HTML (sem JS = números estáticos e corretos).
 * Gráficos são decorativos (aria-hidden). Com prefers-reduced-motion tudo
 * nasce no estado final, sem contagem nem pulso. */

const SVG_NS = "http://www.w3.org/2000/svg";

/** Cor: o JS só informa a posição t ∈ [0,1] de cada elemento (--t); o CSS
 * resolve a cor misturando os tokens da marca (--color-solo-navy →
 * --color-motriz) — nenhuma cor fica fixa aqui. */
function setT(el: HTMLElement | SVGElement, t: number) {
  el.style.setProperty("--t", t.toFixed(3));
}

/** PRNG determinístico — a constelação é sempre a mesma em todo carregamento */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildTicks(host: HTMLElement, count: number) {
  const ticks: HTMLElement[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const tick = document.createElement("div");
    tick.className = "prova-tick";
    setT(tick, t);
    tick.style.setProperty("--tick-h", `${34 + t * 66}%`);
    tick.innerHTML =
      `<span class="prova-tick__bar"><span class="prova-tick__fill"></span></span>` +
      `<span class="prova-tick__idx">${String(i + 1).padStart(2, "0")}</span>`;
    host.appendChild(tick);
    ticks.push(tick);
  }
  return ticks;
}

type Node = { x: number; y: number; dot: SVGCircleElement; halo: SVGCircleElement; g: SVGGElement };
type Edge = { a: number; b: number; line: SVGLineElement };

function buildNetwork(host: HTMLElement, count: number) {
  // telas estreitas: malha mais alta (6×5) para os nós não ficarem miúdos
  const narrow = window.matchMedia("(max-width: 640px)").matches;
  const W = 600;
  const H = narrow ? 400 : 170;
  const cols = narrow ? 6 : 10;
  const rows = Math.ceil(count / cols);
  const rand = mulberry32(8030);
  const cw = W / cols;
  const ch = H / rows;

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    pts.push({
      x: cw * (c + 0.5) + (rand() - 0.5) * cw * 0.7,
      y: ch * (r + 0.5) + (rand() - 0.5) * ch * 0.6,
    });
  }

  // arestas: árvore geradora mínima (rede sempre conectada) + ligações curtas
  // extras para virar malha, não só um caminho.
  const dist = (i: number, j: number) => Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
  const edgeKeys = new Set<string>();
  const pairs: [number, number][] = [];
  const degree = new Array(count).fill(0);
  const addEdge = (i: number, j: number) => {
    const a = Math.min(i, j);
    const b = Math.max(i, j);
    const key = `${a}-${b}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    pairs.push([a, b]);
    degree[a]++;
    degree[b]++;
  };
  const inTree = new Set<number>([0]);
  const treeLens: number[] = [];
  while (inTree.size < count) {
    let best: [number, number, number] = [-1, -1, Infinity];
    inTree.forEach((i) => {
      for (let j = 0; j < count; j++) {
        if (inTree.has(j)) continue;
        const d = dist(i, j);
        if (d < best[2]) best = [i, j, d];
      }
    });
    addEdge(best[0], best[1]);
    treeLens.push(best[2]);
    inTree.add(best[1]);
  }
  const median = [...treeLens].sort((m, n) => m - n)[Math.floor(treeLens.length / 2)];
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      if (degree[i] >= 4 || degree[j] >= 4) continue;
      if (dist(i, j) < median * 1.5) addEdge(i, j);
    }
  }

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("focusable", "false");
  svg.classList.add("prova-network__svg");

  const gEdges = document.createElementNS(SVG_NS, "g");
  const gNodes = document.createElementNS(SVG_NS, "g");
  svg.append(gEdges, gNodes);

  const edges: Edge[] = pairs.map(([a, b]) => {
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", pts[a].x.toFixed(1));
    line.setAttribute("y1", pts[a].y.toFixed(1));
    line.setAttribute("x2", pts[b].x.toFixed(1));
    line.setAttribute("y2", pts[b].y.toFixed(1));
    line.setAttribute("class", "prova-edge");
    line.setAttribute("vector-effect", "non-scaling-stroke");
    setT(line, (pts[a].x + pts[b].x) / 2 / W);
    gEdges.appendChild(line);
    return { a, b, line };
  });

  const nodes: Node[] = pts.map((p) => {
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "prova-node");
    setT(g, p.x / W);
    const halo = document.createElementNS(SVG_NS, "circle");
    halo.setAttribute("class", "prova-node__halo");
    halo.setAttribute("cx", p.x.toFixed(1));
    halo.setAttribute("cy", p.y.toFixed(1));
    halo.setAttribute("r", narrow ? "18" : "13");
    const dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("class", "prova-node__dot");
    dot.setAttribute("cx", p.x.toFixed(1));
    dot.setAttribute("cy", p.y.toFixed(1));
    dot.setAttribute("r", narrow ? "7.5" : "5.5");
    g.append(halo, dot);
    gNodes.appendChild(g);
    return { x: p.x, y: p.y, dot, halo, g };
  });

  host.appendChild(svg);

  // ordem de acendimento: propagação a partir do nó mais à esquerda-centro,
  // por distância — a rede "se espalha" em vez de acender em linha.
  const origin = pts.reduce((best, p, i) => (p.x - Math.abs(p.y - H / 2) < pts[best].x - Math.abs(pts[best].y - H / 2) ? i : best), 0);
  const order = pts
    .map((p, i) => ({ i, d: Math.hypot(p.x - pts[origin].x, (p.y - pts[origin].y) * 1.4) }))
    .sort((m, n) => m.d - n.d)
    .map((o) => o.i);

  return { nodes, edges, order };
}

export function setupProvaStats(reduced: boolean) {
  const root = document.querySelector<HTMLElement>("[data-prova-stats]");
  if (!root) return;

  const anosNum = root.querySelector<HTMLElement>('[data-prova-count="anos"]');
  const clientesNum = root.querySelector<HTMLElement>('[data-prova-count="clientes"]');
  const plus = root.querySelector<HTMLElement>("[data-prova-plus]");
  const ticksHost = root.querySelector<HTMLElement>("[data-prova-ticks]");
  const netHost = root.querySelector<HTMLElement>("[data-prova-network]");
  if (!anosNum || !clientesNum || !plus || !ticksHost || !netHost) return;

  const anosTarget = parseInt(anosNum.dataset.countTo ?? anosNum.textContent ?? "8", 10);
  const clientesTarget = parseInt(clientesNum.dataset.countTo ?? clientesNum.textContent ?? "30", 10);

  const ticks = buildTicks(ticksHost, anosTarget);
  const net = buildNetwork(netHost, clientesTarget);
  const shock = document.createElement("span");
  shock.className = "prova-stat__shock";
  shock.setAttribute("aria-hidden", "true");
  plus.appendChild(shock);

  const lit = new Set<number>();
  const lightNode = (idx: number) => {
    if (lit.has(idx)) return;
    lit.add(idx);
    net.nodes[idx].g.classList.add("is-on");
    net.edges.forEach((e) => {
      if (lit.has(e.a) && lit.has(e.b)) e.line.classList.add("is-on");
    });
  };

  if (reduced) {
    root.classList.add("is-complete");
    ticks.forEach((t) => t.classList.add("is-on"));
    net.order.forEach(lightNode);
    return;
  }

  root.classList.add("is-armed");
  anosNum.textContent = "0";
  clientesNum.textContent = "0";
  gsap.set(plus, { opacity: 0, scale: 0.2 });

  // pulso contínuo da rede — só enquanto a seção está visível
  let pulseCall: gsap.core.Tween | null = null;
  let complete = false;
  const pulseOnce = () => {
    const pick = net.order[Math.floor(Math.random() * net.order.length)];
    const node = net.nodes[pick];
    node.g.classList.remove("is-pulse");
    // reflow para reiniciar a animação CSS do halo
    void node.g.getBoundingClientRect();
    node.g.classList.add("is-pulse");
    const edge = net.edges.find((e) => e.a === pick || e.b === pick);
    if (edge) {
      edge.line.classList.remove("is-signal");
      void edge.line.getBoundingClientRect();
      edge.line.classList.add("is-signal");
    }
    pulseCall = gsap.delayedCall(0.22 + Math.random() * 0.4, pulseOnce);
  };
  const startPulse = () => {
    if (!complete || pulseCall) return;
    pulseOnce();
  };
  const stopPulse = () => {
    pulseCall?.kill();
    pulseCall = null;
  };

  ScrollTrigger.create({
    trigger: root,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => (self.isActive ? startPulse() : stopPulse()),
  });

  const play = () => {
    const tl = gsap.timeline();

    // 0 → 8, cada ano acende uma barra
    const anos = { v: 0 };
    let lastAno = 0;
    tl.to(anos, {
      v: anosTarget,
      duration: 1.6,
      ease: "power1.inOut",
      onUpdate: () => {
        const n = Math.round(anos.v);
        if (n === lastAno) return;
        for (let i = lastAno; i < n; i++) ticks[i]?.classList.add("is-on");
        lastAno = n;
        anosNum.textContent = String(n);
        gsap.fromTo(anosNum, { yPercent: -5 }, { yPercent: 0, duration: 0.3, ease: "power2.out", overwrite: true });
      },
    }, 0);

    // 0 → 30, cada cliente acende um nó da rede
    const cli = { v: 0 };
    let lastCli = 0;
    tl.to(cli, {
      v: clientesTarget,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => {
        const n = Math.round(cli.v);
        if (n === lastCli) return;
        for (let i = lastCli; i < n; i++) lightNode(net.order[i]);
        lastCli = n;
        clientesNum.textContent = String(n);
      },
    }, 0.25);

    // "+" com impacto: entra grande e assenta, onda de choque, a rede inteira pulsa junto
    tl.fromTo(plus,
      { opacity: 0, scale: 2.8, rotate: -30 },
      { opacity: 1, scale: 1, rotate: 0, duration: 0.6, ease: "back.out(2.4)" },
      ">-0.05");
    tl.fromTo(shock,
      { opacity: 0.85, scale: 0.2 },
      { opacity: 0, scale: 3.2, duration: 0.9, ease: "expo.out" },
      "<0.12");
    tl.fromTo(clientesNum,
      { x: 0 },
      { keyframes: [{ x: "-0.03em", duration: 0.08 }, { x: 0, duration: 0.35, ease: "power3.out" }] },
      "<");
    tl.add(() => {
      root.classList.add("is-complete");
      net.nodes.forEach((n) => n.g.classList.add("is-flash"));
      gsap.delayedCall(0.9, () => net.nodes.forEach((n) => n.g.classList.remove("is-flash")));
      complete = true;
      const rect = root.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) startPulse();
    }, "<");
  };

  ScrollTrigger.create({
    trigger: root,
    start: "top 78%",
    once: true,
    onEnter: play,
  });
}
