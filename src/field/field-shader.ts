// Campo de gradiente vivo — não partículas. Em vez de um "starfield" genérico de pontos
// (que não tem relação nenhuma com a marca), o campo é uma versão animada do próprio
// degradê real do VIVA (brand-assets/degrade/DEGRADÊ VIVA.png): manchas de cor que se
// dispersam (Dado), se aproximam (Leitura), se fundem exatamente na composição do
// degradê da marca no momento do Impacto, e se acalmam na Decisão.

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const BLOB_COUNT = 6;

export const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uProgress;   // 0 Dado, 1 Leitura, 2 Impacto, 3 Decisão
  uniform float uTime;
  uniform float uCoreBoost;
  uniform float uAspect;
  uniform vec2 uCursor;

  uniform vec2 uBlobDado[${BLOB_COUNT}];
  uniform vec2 uBlobLeitura[${BLOB_COUNT}];
  uniform vec2 uBlobImpacto[${BLOB_COUNT}];
  uniform vec2 uBlobDecisao[${BLOB_COUNT}];
  uniform vec3 uBlobColor[${BLOB_COUNT}];
  uniform float uBlobRadius[${BLOB_COUNT}];

  vec2 quadMixV2(vec2 a, vec2 b, vec2 c, vec2 d, float t) {
    float seg = clamp(t, 0.0, 3.0);
    if (seg < 1.0) return mix(a, b, seg);
    if (seg < 2.0) return mix(b, c, seg - 1.0);
    return mix(c, d, seg - 2.0);
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= uAspect;

    // dispersão orgânica — some quase totalmente quando o campo se funde no Impacto
    float driftAmount = 0.16 * smoothstep(2.0, 0.5, uProgress);

    vec3 accumColor = vec3(0.0);
    float accumWeight = 0.0;
    float flareWeight = 0.0; // só o blob de clarão (índice 5) — nunca clareia a coluna de texto

    for (int i = 0; i < ${BLOB_COUNT}; i++) {
      vec2 base = quadMixV2(uBlobDado[i], uBlobLeitura[i], uBlobImpacto[i], uBlobDecisao[i], uProgress);
      float seed = float(i) * 12.9898;
      vec2 drift = vec2(sin(uTime * 0.18 + seed), cos(uTime * 0.14 + seed * 1.3)) * driftAmount;
      // no Hero (Dado, progress ~0) o campo segue o cursor com força — é o primeiro
      // contato da página; a partir da Leitura isso se apaga para não perturbar a
      // composição exata que o Impacto recria do degradê real da marca.
      float cursorPull = mix(0.42, 0.05, smoothstep(0.0, 1.2, uProgress));
      vec2 center = base + drift + uCursor * cursorPull;

      float radius = uBlobRadius[i] * mix(1.0, 1.3, smoothstep(0.0, 1.0, uProgress) * smoothstep(3.0, 2.0, uProgress));
      float d = length(uv - center);
      float w = radius * radius / (d * d + radius * radius * 0.28);
      w = pow(w, 1.6);

      accumColor += uBlobColor[i] * w;
      accumWeight += w;
      if (i == 5) flareWeight = w;
    }

    vec3 blend = accumWeight > 0.0001 ? accumColor / accumWeight : vec3(0.0);
    float presence = clamp(accumWeight * 0.55, 0.0, 1.0);

    vec3 base = vec3(0.0, 0.0196, 0.2549); // #000541 — Solo Firme, piso do campo
    vec3 color = mix(base, blend, presence);

    // clarão do impacto — só onde o próprio blob de clarão domina, nunca um clareamento amplo
    float impactGlow = smoothstep(1.5, 2.0, uProgress) * smoothstep(3.4, 2.4, uProgress);
    color = mix(color, vec3(1.0, 0.97, 0.95), impactGlow * clamp(flareWeight, 0.0, 1.0) * 0.55);
    color = mix(color, vec3(1.0, 0.4, 0.36), uCoreBoost * clamp(flareWeight, 0.0, 1.0) * 0.7);

    // granulação sutil — textura, não ruído decorativo genérico
    float grain = fract(sin(dot(vUv * 500.0, vec2(12.9898, 78.233))) * 43758.5453);
    color += (grain - 0.5) * 0.015;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export { BLOB_COUNT };
