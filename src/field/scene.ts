import * as THREE from "three";
import { vertexShader, fragmentShader, BLOB_COUNT } from "./field-shader";

export interface FieldOptions {
  dpr: number;
}

/** Detecta suporte real a WebGL antes de qualquer inicialização — sem isso, o campo nunca é criado. */
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

// Paleta real da marca (brand-assets/paleta-de-cor + degrade/DEGRADÊ VIVA.png) — nenhuma cor nova.
const NAVY = new THREE.Color("#000541");
const RED = new THREE.Color("#EE2629");
const ORANGE = new THREE.Color("#F45A2A"); // tom de transição já presente no degradê real da marca
const FLARE = new THREE.Color("#F2EFEA"); // clarão quase-branco do degradê real, não branco puro

interface BlobSet {
  dado: THREE.Vector2[];
  leitura: THREE.Vector2[];
  impacto: THREE.Vector2[];
  decisao: THREE.Vector2[];
  color: THREE.Color[];
  radius: number[];
}

function v(x: number, y: number) {
  return new THREE.Vector2(x, y);
}

/** As 4 composições do campo-gradiente — a de Impacto recria conceitualmente a paleta e a
 * disposição do degradê real da marca (navy → vermelho, clarão inferior); as demais dispersam,
 * agrupam e relaxam essa mesma composição, nunca introduzindo uma cor fora da paleta. */
function buildBlobs(): BlobSet {
  return {
    color: [NAVY, NAVY.clone().lerp(new THREE.Color("#1a1f5c"), 0.3), RED, RED.clone(), ORANGE, FLARE],
    radius: [0.85, 0.65, 0.8, 0.9, 0.55, 0.7],
    // Dado: disperso pela tela inteira (Hero/Transformação têm texto centralizado com
    // sombra de segurança própria — ver base.css). Leitura/Impacto/Decisão: composição
    // deslocada para a metade DIREITA do quadro — a Demonstração Visual mantém a coluna
    // esquerda (onde o texto mora) estruturalmente livre do campo em todo o pin, não só
    // por sombra de texto.
    dado: [
      v(-1.15, 0.62), v(-1.35, -0.32), v(1.25, 0.68), v(1.35, -0.22), v(-0.95, -0.82), v(1.05, -0.9),
    ],
    leitura: [
      v(0.15, 0.5), v(0.35, 0.2), v(0.95, 0.42), v(1.15, 0.05), v(0.5, -0.3), v(0.85, -0.4),
    ],
    impacto: [
      v(0.15, 0.55), v(0.4, 0.3), v(1.05, 0.35), v(1.35, -0.05), v(0.55, -0.45), v(0.95, -0.3),
    ],
    decisao: [
      v(0.1, 0.6), v(0.4, 0.35), v(1.05, 0.4), v(1.4, 0.0), v(0.6, -0.5), v(1.05, -0.25),
    ],
  };
}

export class Field {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private material: THREE.ShaderMaterial;
  private clockStart = performance.now();
  private cursorTarget = { x: 0, y: 0 };
  private cursorCurrent = { x: 0, y: 0 };
  private progress = 0;
  private coreBoost = 0;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, opts: FieldOptions) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(opts.dpr);

    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera(); // não usado para projeção — o vertex shader escreve clip-space direto

    const geometry = new THREE.PlaneGeometry(2, 2);
    const blobs = buildBlobs();

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uCoreBoost: { value: 0 },
        uAspect: { value: 1 },
        uCursor: { value: new THREE.Vector2(0, 0) },
        uBlobDado: { value: blobs.dado },
        uBlobLeitura: { value: blobs.leitura },
        uBlobImpacto: { value: blobs.impacto },
        uBlobDecisao: { value: blobs.decisao },
        uBlobColor: { value: blobs.color.map((c) => new THREE.Vector3(c.r, c.g, c.b)) },
        uBlobRadius: { value: blobs.radius },
      },
    });

    const mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(mesh);

    window.addEventListener("mousemove", this.onMouseMove);
    void BLOB_COUNT;
  }

  private onMouseMove = (e: MouseEvent) => {
    this.cursorTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.cursorTarget.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };

  setProgress(p: number) {
    this.progress = p;
  }

  setCoreBoost(v: number) {
    this.coreBoost = v;
  }

  resize(width: number, height: number, dpr: number) {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    this.material.uniforms.uAspect.value = width / height;
  }

  render() {
    if (this.disposed) return;
    const t = (performance.now() - this.clockStart) / 1000;

    this.cursorCurrent.x += (this.cursorTarget.x - this.cursorCurrent.x) * 0.07;
    this.cursorCurrent.y += (this.cursorTarget.y - this.cursorCurrent.y) * 0.07;

    this.material.uniforms.uProgress.value = this.progress;
    this.material.uniforms.uTime.value = t;
    this.material.uniforms.uCoreBoost.value = this.coreBoost;
    (this.material.uniforms.uCursor.value as THREE.Vector2).set(this.cursorCurrent.x, this.cursorCurrent.y);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    window.removeEventListener("mousemove", this.onMouseMove);
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) obj.geometry.dispose();
    });
    this.material.dispose();
    this.renderer.dispose();
  }
}
