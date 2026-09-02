# VIVA — Landing Page: Copy + Descrição Visual

> Documento gerado a partir do código-fonte atual (`index.html` + `src/styles/base.css`). Cobre toda a copy da página, seção por seção, com a descrição de como cada uma se apresenta visualmente.
>
> **Atualizado após a remoção da seção `#indicadores`** (dado sensível/território CRED MHS) — a página agora só usa números fictícios na seção de demonstração, e `#prova` ficou sem números reais, apenas texto + nota de pendência.

---

## 1. Visão geral

- **Título da aba:** VIVA — O dado é técnico. A decisão é financeira.
- **Meta description:** O VIVA interpreta o dado técnico de saúde e segurança da sua operação e revela o impacto econômico por trás dele, para que você decida com mais evidência.
- **Idioma:** pt-BR
- **Formato:** single page, scroll contínuo, dividida em `stages` (seções full-bleed) com um **canvas de fundo animado** (`#field-canvas`) que muda de comportamento conforme a seção (`data-field-stage`), criando uma sensação de "atravessar um campo" que reage à rolagem.
- **Ordem atual das seções:** Hero → Problema → Transformação → Demonstração → Jornada → Prova → Agência → CTA final. *(A seção "Leitura em ação" / `#indicadores`, com dados reais de operação/saúde/psicossocial, foi removida.)*

### Paleta de cores
| Token | Valor | Uso |
|---|---|---|
| `--color-campo-aberto` | `#EDEDED` | cor clara/texto sobre fundo escuro (quase branco) |
| `--color-motriz` | `#EE2629` | vermelho de marca — cor de destaque/ação (CTAs, gráficos, gradientes) |
| `--color-solo-navy` | `#000541` | azul-marinho quase preto — base escura |
| `--color-solo-black` | `#1A1A1A` | preto suave — cor de texto principal |

Gradiente usado nos gráficos da demonstração: **vermelho → roxo → azul** (`#EE2629 → #A63BD1 → #4A5FEA`).

### Tipografia
- Fonte única: **Inter** (sans-serif), usada tanto no corpo quanto nos títulos — não há uma fonte de display separada.
- Números, labels técnicas, eixos de gráfico e legendas usam fonte **monoespaçada** (`ui-monospace / JetBrains Mono`), em caixa alta com letter-spacing largo — reforça a linguagem "técnica/dado".

### Sensação geral de movimento
- Textos entram com efeitos de **split/reveal** (`data-split`, `data-reveal`, `data-reveal-group`) ao entrar no viewport — títulos parecem se "montar" e parágrafos sobem/aparecem suavemente.
- Easings customizados nomeados `--ease-field` e `--ease-atmosphere`, sugerindo transições orgânicas, não lineares — coerente com a metáfora de "campo".
- Vários elementos numéricos fazem **contagem animada** (`data-count-to`) — os números "sobem" até o valor final quando entram em tela.
- **Novo:** os 4 cards da seção de demonstração agora são **tilt cards** (`data-tilt-card`, via GSAP em `src/motion/tilt-card.ts`) — ao passar o cursor, o card inclina levemente em 3D acompanhando a posição do mouse, ganha uma borda mais clara, uma sombra colorida (vermelho/roxo) e um "reflexo" radial que segue o cursor. Em telas sem hover (touch), esse efeito simplesmente não aparece.

---

## 2. Header (fixo/topo)

- **Logo:** wordmark "VIVA" em SVG (ícone abstrato, não é texto tipografado), link para `#hero`.
- **Navegação:**
  - "Entrar"
  - "Quero uma demonstração" (estilizado como CTA, destaca-se do link simples)

---

## 3. Seção `#hero`

**Visual:** primeira tela, canvas de fundo no estágio `0` (estado inicial/mais "vazio" do campo). Texto centralizado/empilhado, com um "cue" de scroll na base.

**Copy:**
- Eyebrow: `VIVA`
- H1 (display): **"O dado é técnico. A decisão é financeira."**
- Parágrafo (lede): "Sua operação já gera, todo mês, dado técnico de saúde e segurança. O VIVA interpreta esses dados e revela o impacto econômico por trás deles, para que você decida com mais evidência onde investir, o que ampliar e o que revisar."
- Botão primário: **"Quero uma demonstração"** → `#cta-final`
- Indicação de scroll (decorativa): "role para atravessar o campo"

---

## 4. Seção `#problema` — "O ponto de partida"

**Visual:** estágio `0` do campo (continuidade com o hero). Bloco de texto simples, sem elementos gráficos — é a seção de "provocação".

**Copy:** *(título alterado)*
- Kicker: "O ponto de partida"
- H2: **"Você visualiza o dado. Mas conhece o risco de impacto no seu negócio?"** ⟵ *antes: "Você conhece o dado. Mas sabe o que ele vale para o negócio?"*
- Corpo: "O dado existe. O que falta é a leitura: sem ela, você decide com informação incompleta — e o risco por trás de cada número continua invisível."

---

## 5. Seção `#transformacao` — "Como o VIVA lê o seu dado"

**Visual:** estágio `1` do campo. Lista numerada de 3 "pilares" (`01`, `02`, `03`), cada item com índice grande, nome e descrição curta — layout de cards/linha, revelados em sequência (`data-reveal-group`, `data-cluster`).

**Copy:** *(sem alterações)*
- Kicker: "Como o VIVA lê o seu dado"
- H2: **"O VIVA transforma dado técnico em decisão financeira."**
- **01 — Diagnóstico:** "Leitura clara do perfil de risco da sua operação, a partir do dado que já existe."
- **02 — Leitura econômico-financeira:** "O dado técnico traduzido em risco, impacto financeiro e retorno por decisão."
- **03 — Decisão:** "Você enxerga os caminhos e o impacto de cada escolha."

---

## 6. Seção `#demonstracao` — "Demonstração visual" (o coração visual da página)

**Visual:** estágio `1-2` (transição). Grid de **4 cards** conectados por linhas de fluxo animadas (`demo-flow`, com um "cometa" percorrendo horizontal e vertical entre os cards — simboliza o dado fluindo de um estágio ao outro). Cada card tem um número/eyebrow (01–04), um headline, e uma peça de interface gráfica funcional (SVGs animados com contagem de números), e agora reage ao cursor com o efeito de **tilt 3D** descrito acima.

> Aviso de rodapé da seção: *"Demonstração ilustrativa com dados fictícios, para fins de exemplificação."*

Kicker: "Demonstração visual" · H2: **"Um dado. Múltiplas escolhas."** ⟵ *antes: "Um dado. Uma leitura possível."* · Lede: "Veja como um dado técnico se transforma em inteligência para decisões com impacto financeiro."

### Card 01 — Identifica
- Headline: "Transforme volume em leitura."
- Número animado: **1.200** procedimentos realizados no período analisado. ⟵ *antes: 3.867*
- Visual: gráfico de linha/área (estilo dashboard financeiro) mostrando evolução mensal Jan→Jun, com gradiente vermelho sob a curva, pontos marcados por mês e um "traveler" (ponto que percorre a linha). *(forma do gráfico inalterada)*

### Card 02 — Contextualiza
- Headline: "Quanto isso representa no mercado?"
- Número animado: **R$ 60,00** por procedimento (referência de mercado). ⟵ *antes: R$ 50,00*
- Visual: barra vertical tipo termômetro/benchmark com gradiente vermelho→roxo→azul, escala de 0 a 100 com marcação destacada agora em **"60 · referência"**, e pequenas partículas subindo (efeito de "enchendo").

### Card 03 — Compara
- Headline: "Sua operação × referência"
- Visual: comparação em barras horizontais com "scan" animado passando por cima:
  - Referência: **R$ 72.000** (barra cheia, 100%) ⟵ *antes: R$ 193.350*
  - Sua operação: **R$ 58.000** (barra a 81%) ⟵ *antes: R$ 152.780 (79%)*
  - Diferença: **R$ 14.000** → **↓ 19% abaixo da referência** ⟵ *antes: R$ 40.570 / 21%*

### Card 04 — Revela
- Headline: "Impacto estimado"
- Número grande/hero: **R$ 14.000** ⟵ *antes: R$ 40.570*
- Visual: anel/ring circular (donut) com gradiente vermelho→roxo→azul, girando, com pequenos pontos orbitando ao redor (como satélites) — no centro, **↓ 19% abaixo da referência**.
- Nota final do card: "O número deixa de ser apenas técnico e passa a revelar seu impacto econômico."

---

## 7. Seção `#jornada` — "No tempo"

**Visual:** estágio `3`. Lista/loop visual dos 6 passos do ciclo, o último ("Nova leitura") estilizado como retorno ao início (`loop-list__return`) — reforça a ideia de ciclo contínuo, não linear.

**Copy:** *(sem alterações)*
- Kicker: "No tempo"
- H2: **"Sua operação não muda em uma tela. Evolui a cada decisão."**
- Ciclo: Diagnóstico → Leitura → Insight → Decisão → Acompanhamento → **Nova leitura** (volta ao ciclo)
- Corpo: "O VIVA acompanha sua operação ao longo do tempo — cada decisão gera uma nova leitura, e cada leitura abre uma nova decisão."

---

## 8. ~~Seção `#indicadores`~~ — REMOVIDA

A seção "Leitura em ação" (dashboard com KPIs reais de operação, saúde, fator psicossocial e o placeholder financeiro) **não existe mais na página**. Ela usava dados sensíveis de território CRED MHS que não estavam autorizados para publicação neste formato. A página agora salta diretamente de `#jornada` para `#prova`.

---

## 9. Seção `#prova` — "Evidência"

**Visual:** estágio de "pausa" (`data-field-stage="pause"`) — o campo desacelera, seção mais silenciosa/contemplativa. **Simplificada:** a timeline em barras aninhadas (35 anos / 8 em operação) que existia antes foi removida — a seção agora é só texto + nota de pendência, sem nenhum número ou gráfico.

**Copy:** *(reescrita — antes tinha números "35" e "8" explícitos, agora não tem nenhum número)*
- Kicker: "Evidência"
- H2: **"Menos suposição. Mais evidência."**
- Corpo: **"Anos de método e operação, com resultado validado por clientes ativos."** ⟵ *novo — antes não existia esse parágrafo, e sim a timeline visual*
- Nota pendente: **"Os indicadores desta seção (anos de experiência, clientes ativos e resultado por caso) seguem em validação — atualizamos assim que forem autorizados para publicação."** ⟵ *antes mencionava só "clientes ativos e resultado por caso" como pendentes, porque "anos de experiência" já aparecia como número (35/8) na timeline*

---

## 10. Seção `#agencia` — "O papel do VIVA"

**Visual:** estágio `cursor` — coluna estreita e centralizada (`stage__inner--narrow`), tom mais manifesto/declaração. Termina com uma "assinatura" estilizada isoladamente.

**Copy:** *(sem alterações)*
- Kicker: "O papel do VIVA"
- H2: **"O VIVA não escolhe por você."**
- Corpo: "Ele mostra riscos, cenários e impactos. Você não recebe apenas um dado — você enxerga os caminhos e o impacto de cada escolha."
- Assinatura: **"A escolha é sua."**

---

## 11. Seção `#cta-final` — Fechamento

**Visual:** estágio `4` — resolução final do campo (o estado mais "cheio"/resolvido da animação de fundo, fechando a jornada visual iniciada no hero). Coluna estreita e centralizada.

**Copy:** *(sem alterações)*
- H2: **"Veja o que seus dados ainda não estão mostrando."**
- Corpo: "Conheça a leitura econômico-financeira da sua operação e enxergue o impacto por trás de cada decisão."
- Botão primário: **"Quero uma demonstração"**
- Link secundário: "Já conheceu o VIVA e quer avançar? Quero acesso"

---

## 12. Rodapé

- Logo VIVA (mesmo SVG do header)
- Navegação: "Entrar" · "Quero uma demonstração"

---

## 13. Resumo da jornada narrativa (atualizado)

1. **Hero** — provocação inicial (dado vs. decisão)
2. **Problema** — visualizar o dado não é o mesmo que conhecer o risco
3. **Transformação** — como o VIVA lê (3 pilares)
4. **Demonstração** — prova visual do processo (identifica → contextualiza → compara → revela), agora com cards que reagem ao cursor (tilt 3D)
5. **Jornada no tempo** — não é uma foto, é um ciclo
6. ~~Indicadores reais~~ — **removida**
7. **Evidência/prova social** — agora só texto + pendência, sem números expostos
8. **Agência** — reforço de que a decisão continua humana
9. **CTA final** — fechamento e conversão

O fio condutor visual continua sendo a metáfora do **"campo"**: um fundo animado contínuo que muda de estado a cada seção (`data-field-stage`), como se o usuário estivesse literalmente atravessando um território até chegar à decisão. Com a remoção do bloco de indicadores reais, a página ficou mais curta e mantém os números **exclusivamente fictícios**, concentrados na seção de demonstração — reduzindo a exposição de dados sensíveis até que estejam formalmente autorizados.
