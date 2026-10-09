# 🪖 Trincheira 1944: Experiência Sonora & Museu Didático

> Um simulador imersivo e didático de trincheira da Segunda Guerra Mundial com síntese sonora em tempo real via **Web Audio API**, permitindo experimentar e aprender sobre armas históricas, aviões, tanques, artilharia e as condições reais de combate de 1939 a 1945.

---

## 🎯 Sobre o Projeto

O **Trincheira 1944** foi desenvolvido para transformar o aprendizado de História Militar em uma experiência sensorial e didática. Em vez de arquivos de áudio estáticos pré-gravados, o app emprega um **motor de áudio procedural** em JavaScript/TypeScript que sintetiza digitalmente as frequências, cadências, ressonâncias e ecos de armas e veículos da Segunda Guerra Mundial.

O usuário pode assumir a posição de vigia em diferentes trincheiras históricas (Normandia, Stalingrado, Ardenas e Monte Castelo com a Força Expedicionária Brasileira), escutar o ambiente da trincheira, disparar armas individualmente ou acionar sequências de bombardeios coordenados.

---

## 🔊 Acervo Sonoro & Síntese Procedural (Web Audio API & Áudio Posicional 3D)

O motor acústico (`soundEngine.ts`) implementa:
- **Áudio Posicional 3D com `PannerNode` & `AudioListener`**: modelo espacial binaural HRTF com simulação física de coordenadas Cartesianas `(X, Y, Z)` da trincheira, coning direcional de emissão sonora, atenuação por distância `inverse` e trajetórias dinâmicas animadas (sobrevoo de Spitfire, mergulho vertical do Stuka, varredura de bombardeiros B-17 e projéteis supersônicos raspando o parapeito a centímetros do ouvido).
- **Convolução de Resposta ao Impulso (Impulse Response)**: simulação das reflexões acústicas em madeira, lama, sacos de areia e casamatas de concreto (RT60: 2,4s em terra úmida).
- **Filtros Passa-Baixas e Atenuação Atmosférica**: cálculo dinâmico para distâncias de 14 m, 70 m e 280 m.

- **Armas de Infantaria**:
  - `M1 Garand`: Semiautomático calibre .30-06 com a emblemática ejeção acústica metálica (*ping* do clipe em bloco em ~2400 Hz).
  - `MG 42`: A célebre "Serra Circular de Hitler" (*Hitlersäge*) disparando a 1.200 tiros por minuto.
  - `Karabiner 98k`: Estalo seco do fuzil Mauser por ferrolho com o clique mecânico de recarga.
  - `Thompson M1A1`: Rajadas encorpadas subsônicas de calibre .45 ACP.
  - `Morteiro de Trincheira`: Baque no tubo, assobio aerodinâmico em parábola e detonação de cratera.

- **Aviação de Combate**:
  - `Junkers Ju 87 "Stuka"`: O uivo aterrorizante da *Trombeta de Jericó* em mergulho vertical a 80 graus e impacto de bomba de 250 kg.
  - `Supermarine Spitfire`: O rugido do motor Rolls-Royce Merlin V-12 e passagens rasantes com metralhadoras em combate aéreo.
  - `Boeing B-17 Flying Fortress`: O zumbido grave de motores radiais quadrimotores e o assobio de bombas caindo em série.

- **Blindados & Tanques**:
  - `Panzer VI Tiger I`: Motor Maybach V-12 diesel, rangido das esteiras de aço e o canhão de 88 mm KwK 36.
  - `T-34/76`: Ruído áspero do motor diesel V-2 soviético e canhão de 76,2 mm na lama da Raspútitsa.
  - `M4 Sherman`: Vibração do motor radial Continental e metralhadora pesada Browning .50.

- **Artilharia & Explosões**:
  - `Lançador de Foguetes Katyusha (BM-13)`: O assobio polifônico em salvas do "Órgão de Stálin".
  - `Obus Pesado de 105 mm`: Impacto com choque de sub-graves, silvo supersônico e chuva de estilhaços.
  - `Bombardeio Naval do Dia D`: Troar sísmico de canhões de 14 a 16 polegadas disparados a partir de couraçados.
  - `Granadas de Mão`: Estalo da colher, chiado pirotécnico do pavio de 4,5 segundos e explosão interna no abrigo.

- **Camadas Contínuas de Ambiente**:
  - Chuva caindo sobre as tábuas de madeira da trincheira.
  - Vento gélido soprando pelos parapeitos de sacos de areia e arames farpados.
  - Estrondos randômicos de artilharia pesada distante no horizonte.
  - Rádio de campanha militar com estática e transmissões em código Morse.

---

## 📚 Módulos Didáticos de História

1. **Cenários Históricos de Trincheira**:
   - **Batalha de Stalingrado (1942–1943)**: A *Rattenkrieg* (guerra de ratos) nos escombros de fábricas e porões congelados.
   - **Normandia: Dia D & Bocage (1944)**: Trincheiras camufladas nas sebes vivas francesas e bombardeio naval.
   - **Batalha de Monte Castelo (1944–1945)**: A vitória heroica da **Força Expedicionária Brasileira (FEB)** nas trincheiras gélidas dos Apeninos italianos.
   - **Batalha do Bulge / Ardenas (1944–1945)**: Foxholes cavados na neve sob bombardeio de estilhaços nas copas dos pinheiros.

2. **Museu do Armamento**:
   - Fichas técnicas detalhadas: calibres, cadência de tiro, alcance efetivo, tripulação e contexto militar.
   - Explicação da física acústica e psicologia de combate de cada equipamento.

3. **A Vida na Trincheira**:
   - Diferenças fundamentais entre as trincheiras da 1ª e da 2ª Guerra Mundial.
   - Condições sanitárias e a prevenção do "pé de trincheira" (*trench foot*).
   - O impacto neurológico e a "Fadiga de Combate" (*Shell Shock*).
   - Acústica como ferramenta primordial de sobrevivência do soldado.

4. **Desafio de Reconhecimento Acústico**:
   - Quiz interativo que reproduz áudios para o usuário identificar o armamento.
   - Explicações pedagógicas imediatas com fatos históricos para fixação do aprendizado.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior.
- Gerenciador de pacotes `npm`.

### Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/trincheira-1944.git

# Acesse a pasta do projeto
cd trincheira-1944

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Abra o navegador no endereço indicado (geralmente `http://localhost:3000`).

---

## 🌐 Publicação no GitHub Pages

Este projeto está pronto para publicação direta no **GitHub Pages**!

### Método 1: Automático via GitHub Actions (Recomendado)

O projeto já inclui o arquivo `.github/workflows/deploy.yml` e o `package-lock.json`.

1. Suba o código para o seu repositório no GitHub (`git add .`, `git commit -m "feat: initial commit"`, `git push origin main`).
2. Acesse o seu repositório no GitHub: **Settings** > **Pages**.
3. Na seção **Build and deployment** > **Source**, selecione **GitHub Actions**.
4. Cada push na branch `main` ou `master` acionará automaticamente a compilação e publicação do site sem erros de lockfile.

### Método 2: Compilação Manual

Você pode gerar a versão de produção compatível com caminhos relativos para qualquer hospedagem estática executando:

```bash
# Compila o projeto com base relativa ('./')
npm run build:gh-pages
```

A pasta `dist/` gerada conterá todos os arquivos estáticos prontos para upload ou commit na branch `gh-pages`.

---

## 🛠 Tecnologias Utilizadas

- **React 19** com TypeScript
- **Vite 8**
- **Tailwind CSS v4**
- **Web Audio API** nativa (Osciladores, Convoluções, Filtros Biquad, Ganho e Panners estéreo)
- **Lucide Icons**
- **Cinzel & Plus Jakarta Sans** (tipografia histórica e de alta legibilidade)

---

## 📜 Licença

Distribuído sob a licença Apache 2.0. Consulte o arquivo `LICENSE` ou os cabeçalhos de código para obter mais detalhes.
