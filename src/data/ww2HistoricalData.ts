/**
 * WW2 Historical & Didactic Database
 * Detailed historical facts, sound mechanics, battle contexts, and acoustic science.
 */

import trenchPanoramicImg from '../assets/images/ww2_trench_dugout_panoramic_1791568859285.jpg';
import stalingradImg from '../assets/images/ww2_stalingrad_rubble_trench_1791568870090.jpg';
import normandyImg from '../assets/images/ww2_normandy_bocage_trench_1791568879395.jpg';
import monteCasteloImg from '../assets/images/ww2_feb_monte_castelo_italy_1791568888567.jpg';
import trenchAppThumbImg from '../assets/images/trench_app_thumb_1791633634625.jpg';
import trenchAppIconImg from '../assets/images/trench_app_icon_1791633643665.jpg';

export {
  trenchPanoramicImg,
  stalingradImg,
  normandyImg,
  monteCasteloImg,
  trenchAppThumbImg,
  trenchAppIconImg,
};

export interface SoundItem {
  id: string;
  name: string;
  subtitle: string;
  category: 'weapons' | 'planes' | 'tanks' | 'artillery';
  faction: 'Aliados (EUA/GB)' | 'Eixo (Alemanha)' | 'União Soviética' | 'Brasil (FEB)';
  year: string;
  specs: {
    caliberOrEngine: string;
    rateOrSpeed: string;
    range: string;
    weightOrCrew: string;
  };
  acousticCuriosity: string;
  historicalContext: string;
  tacticalTrenchRole: string;
  soundAction: 'm1garand' | 'mg42' | 'kar98k' | 'thompson' | 'mortar' | 'stuka' | 'spitfire' | 'b17' | 'tiger1' | 't34' | 'sherman' | 'katyusha' | 'howitzer105' | 'navalBombardment' | 'grenade' | 'bulletWhiz';
}

export interface BattleScenario {
  id: string;
  title: string;
  year: string;
  location: string;
  image: string;
  summary: string;
  trenchType: string;
  tacticalConditions: string[];
  historicalNarrative: string;
  suggestedAmbience: {
    rain: boolean;
    wind: boolean;
    distantWar: boolean;
    radio: boolean;
    weapons: ('m1garand' | 'mg42' | 'kar98k' | 'mortar' | 'stuka' | 'katyusha' | 'tiger1' | 'howitzer105' | 'spitfire' | 'thompson')[];
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  soundAction?: SoundItem['soundAction'];
  options: string[];
  correctIndex: number;
  explanation: string;
  historicalFact: string;
}

export const SOUND_ITEMS: SoundItem[] = [
  // ARMAS DE INFANTARIA
  {
    id: 'm1-garand',
    name: 'M1 Garand',
    subtitle: 'Fuzil Semiautomático Padrão dos EUA',
    category: 'weapons',
    faction: 'Aliados (EUA/GB)',
    year: '1936 - 1957',
    specs: {
      caliberOrEngine: '.30-06 Springfield (7,62×63 mm)',
      rateOrSpeed: '40 a 50 tiros/minuto (semiauto)',
      range: 'Alcance efetivo de 400 m',
      weightOrCrew: '4,3 kg (1 atirador)',
    },
    acousticCuriosity: 'O famoso estalo metálico ("ping") ao ejetar o clipe vazio de 8 munições era audível a dezenas de metros nas trincheiras. Circulou o mito de que os alemães esperavam o som para atacar, mas no estrondo da batalha o barulho costumava ser abafado.',
    historicalContext: 'O general George S. Patton descreveu o M1 Garand como "o maior implemento de batalha jamais concebido". Foi o primeiro fuzil semiautomático padrão distribuído em massa para toda a infantaria de um país beligerante.',
    tacticalTrenchRole: 'Conferia aos soldados aliados superioridade de cadência de tiro imediata ao repelir assaltos frontais contra trincheiras e parapeitos sem precisar recuar ferrolhos manuais.',
    soundAction: 'm1garand',
  },
  {
    id: 'mg42',
    name: 'MG 42',
    subtitle: 'A "Serra Circular de Hitler" (Hitlersäge)',
    category: 'weapons',
    faction: 'Eixo (Alemanha)',
    year: '1942 - 1945',
    specs: {
      caliberOrEngine: '7,92×57 mm Mauser',
      rateOrSpeed: '1.200 a 1.500 tiros/minuto',
      range: 'Alcance efetivo de 1.000 m (bipé) / 2.000 m (tripé)',
      weightOrCrew: '11,5 kg (guarnição de 3 a 4 soldados)',
    },
    acousticCuriosity: 'Devido à sua cadência vertiginosa (25 tiros por segundo), o ouvido humano não conseguia distinguir tiros individuais, percebendo o som como um rasgo contínuo de pano ou o zumbido cortante de uma serra elétrica.',
    historicalContext: 'Projetada para substituir a mais cara e lenta MG 34, a MG 42 utilizava estampagem em chapa de aço e permitia troca de cano superaquecido em menos de 5 segundos pelos serventes da trincheira.',
    tacticalTrenchRole: 'Arma âncora da doutrina defensiva alemã. Um único ninho de metralhadora fortificado com sacos de areia podia imobilizar companhias inteiras em terreno aberto (No Man\'s Land).',
    soundAction: 'mg42',
  },
  {
    id: 'kar98k',
    name: 'Karabiner 98k',
    subtitle: 'Fuzil de Repetição Mauser por Ferrolho',
    category: 'weapons',
    faction: 'Eixo (Alemanha)',
    year: '1935 - 1945',
    specs: {
      caliberOrEngine: '7,92×57 mm Mauser',
      rateOrSpeed: '15 tiros/minuto (ferrolho manual)',
      range: 'Alcance efetivo de 500 m (800 m com mira telescópica)',
      weightOrCrew: '3,9 kg (1 atirador / sniper)',
    },
    acousticCuriosity: 'Estalo seco e estrondoso seguido pelo clique mecânico metálico do manuseio do ferrolho e queda da cápsula deflagrada na lama da trincheira.',
    historicalContext: 'Fuzil de serviço padrão da Wehrmacht durante toda a guerra. Reconhecido pela extrema robustez do mecanismo Mauser de ferrolho rotativo e precisão balística formidável.',
    tacticalTrenchRole: 'Arma dos atiradores de elite (scharfschütze) em trincheiras e escombros urbanos, caçando oficiais e vigias que espreitavam acima do parapeito.',
    soundAction: 'kar98k',
  },
  {
    id: 'thompson',
    name: 'Thompson M1A1',
    subtitle: 'Submetralhadora "Tommy Gun"',
    category: 'weapons',
    faction: 'Aliados (EUA/GB)',
    year: '1938 - 1945',
    specs: {
      caliberOrEngine: '.45 ACP (11,43 mm)',
      rateOrSpeed: '600 a 700 tiros/minuto',
      range: 'Alcance efetivo de 50 m',
      weightOrCrew: '4,8 kg carregada',
    },
    acousticCuriosity: 'Batida encorpada e abafada dos projéteis pesados e subsônicos de calibre .45, sem o estalo supersônico agudo dos fuzis de alta velocidade.',
    historicalContext: 'Originalmente desenvolvida no fim da Primeira Guerra Mundial para "limpar trincheiras", foi adotada por sargentos, paraquedistas e patrulhas de reconhecimento na 2ª Guerra.',
    tacticalTrenchRole: 'Devastadora no combate corpo a corpo dentro das curvas e abrigos das trincheiras (bunkers e dugouts), onde o alcance curto compensava com poder de parada brutal.',
    soundAction: 'thompson',
  },
  {
    id: 'mortar',
    name: 'Morteiro de Trincheira (Granatwerfer / M2)',
    subtitle: 'Artilharia Curva de Infantaria',
    category: 'weapons',
    faction: 'Aliados (EUA/GB)',
    year: '1940 - 1945',
    specs: {
      caliberOrEngine: '60 mm ou 81 mm HE',
      rateOrSpeed: '18 a 30 disparos/minuto',
      range: '100 m até 1.800 m',
      weightOrCrew: '19 kg (3 soldados)',
    },
    acousticCuriosity: 'O característico baque oco do tubo ("plump") seguido por um silvo ascendente e descendente de cerca de 2 segundos, encerrando em uma explosão abafada de estilhaços.',
    historicalContext: 'Capaz de realizar disparos com ângulo superior a 45 graus, permitia atingir alvos entrincheirados que a artilharia de tiro tenso não conseguia alcançar.',
    tacticalTrenchRole: 'Disparado de dentro de poços protegidos de trincheira para saturar parapeitos inimigos e posições de metralhadora com granadas de fragmentação.',
    soundAction: 'mortar',
  },
  {
    id: 'sniper-whiz',
    name: 'Tiro Rasante & Projétil Supersônico (3D)',
    subtitle: 'Projétil 7.92mm Mauser cruzando a centímetros do capacete',
    category: 'weapons',
    faction: 'Eixo (Alemanha)',
    year: '1939 - 1945',
    specs: {
      caliberOrEngine: '7,92×57 mm Mauser Spitzgeschoss',
      rateOrSpeed: 'Velocidade de boca: 760 a 860 m/s (Mach 2,5)',
      range: 'Tiro de precisão até 800 m',
      weightOrCrew: 'Projétil de 12,8 g',
    },
    acousticCuriosity: 'Fenômeno acústico puro em 3D: o estalo supersônico agudo (Mach cone snap) atinge o ouvido antes do estampido da arma, seguido pelo zunido cortante do ar e pelo impacto violento nos troncos do parados.',
    historicalContext: 'Snipers em Stalingrado e na Normandia mantinham soldados imobilizados sob o nível do parapeito. Erguer a cabeça por 2 segundos era frequentemente fatal.',
    tacticalTrenchRole: 'Interdição psicológica e vigilância letal de frestas de tiro e periscópios nas linhas de trincheira.',
    soundAction: 'bulletWhiz',
  },

  // AVIÕES
  {
    id: 'stuka',
    name: 'Junkers Ju 87 "Stuka"',
    subtitle: 'Bombardeiro de Mergulho com Sirene Jericho',
    category: 'planes',
    faction: 'Eixo (Alemanha)',
    year: '1936 - 1945',
    specs: {
      caliberOrEngine: 'Junkers Jumo 211 V-12 (1.200 hp)',
      rateOrSpeed: 'Até 600 km/h em mergulho vertical',
      range: 'Carga de 1 bomba de 250 kg ou 500 kg',
      weightOrCrew: 'Piloto + artilheiro traseiro',
    },
    acousticCuriosity: 'A "Trombeta de Jericó" (Jericho-Trompete): pequenas hélices acionadas pelo fluxo de ar nos trens de pouso geravam um uivo estridente aterrorizante durante o mergulho de 80 graus, concebido para quebrar a moral dos defensores nas trincheiras.',
    historicalContext: 'Símbolo tático da Blitzkrieg alemã. O piloto mergulhava quase na vertical diretamente sobre o alvo com freios aerodinâmicos, soltando a bomba com extrema precisão visual.',
    tacticalTrenchRole: 'Destruição pontual de nós fortificados, pontes, casamatas e redutos de trincheiras que bloqueavam o avanço das divisões Panzer.',
    soundAction: 'stuka',
  },
  {
    id: 'spitfire',
    name: 'Supermarine Spitfire',
    subtitle: 'Caça Interceptador de Asas Elípticas',
    category: 'planes',
    faction: 'Aliados (EUA/GB)',
    year: '1938 - 1948',
    specs: {
      caliberOrEngine: 'Rolls-Royce Merlin 61 V-12 (1.565 hp)',
      rateOrSpeed: '600 km/h (Mk IX)',
      range: 'Canhões 20 mm Hispano + metralhadoras Browning .303',
      weightOrCrew: '1 piloto',
    },
    acousticCuriosity: 'O inconfundível ronco gutural e melodioso do motor Rolls-Royce Merlin, seguido pelo zunido cortante das metralhadoras disparando em passagens rasantes a baixa altitude.',
    historicalContext: 'Herói da Batalha da Grã-Bretanha e apoio aéreo tático na Normandia. Suas asas elípticas conferiam agilidade incomparável em combates aéreos (dogfights).',
    tacticalTrenchRole: 'Varridas de metralhamento contra colunas alemãs e trincheiras de reforço, impedindo o movimento inimigo durante o dia.',
    soundAction: 'spitfire',
  },
  {
    id: 'b17',
    name: 'Boeing B-17 Flying Fortress',
    subtitle: 'Bombardeiro Estratégico Pesado Quadrimotor',
    category: 'planes',
    faction: 'Aliados (EUA/GB)',
    year: '1938 - 1945',
    specs: {
      caliberOrEngine: '4 motores radiais Wright R-1820 (1.200 hp cada)',
      rateOrSpeed: '462 km/h / Teto operacional de 10.850 m',
      range: 'Até 3.600 kg de bombas',
      weightOrCrew: '10 tripulantes (13 metralhadoras .50)',
    },
    acousticCuriosity: 'Um zumbido grave e hipnótico de baixa frequência produzido por dezenas de bombardeiros voando em formação em caixa ("combat box"), fazendo tremer o solo das trincheiras antes da chuva de bombas assobiantes.',
    historicalContext: 'Espinha dorsal da 8ª Força Aérea dos EUA na Europa, operando bombardeios diurnos de alta altitude sobre a indústria militar do Eixo.',
    tacticalTrenchRole: 'Bombardeios táticos de saturação pré-ofensiva (como na Operação Cobra na Normandia), abrindo brechas em linhas de trincheiras profundamente fortificadas.',
    soundAction: 'b17',
  },

  // TANQUES E BLINDADOS
  {
    id: 'tiger1',
    name: 'Panzer VI Tiger I',
    subtitle: 'Tanque Pesado Alemão com Canhão 88 mm',
    category: 'tanks',
    faction: 'Eixo (Alemanha)',
    year: '1942 - 1944',
    specs: {
      caliberOrEngine: 'Maybach HL230 P45 V-12 gasolina (700 hp)',
      rateOrSpeed: '38 km/h na estrada / 20 km/h no terreno',
      range: 'Canhão 8,8 cm KwK 36 L/56 (munição perfurante PzGr 39)',
      weightOrCrew: '57 toneladas (5 tripulantes)',
    },
    acousticCuriosity: 'O estalar metálico pesado das esteiras sobre a lama, o ronco profundo do motor Maybach e o estrondo ensurdecedor do canhão de 88 mm, cujo projétil viajava a mais de 800 m/s.',
    historicalContext: 'Um dos blindados mais temidos da história militar. Blindagem frontal de 100 mm praticamente impenetrável pelos canhões padrão aliados de 1942-1943.',
    tacticalTrenchRole: 'Rompimento de linhas fortificadas e "caça-tanques" de longo alcance. Capaz de destruir blindados e posições de infantaria a mais de 1.500 metros.',
    soundAction: 'tiger1',
  },
  {
    id: 't34',
    name: 'T-34/76',
    subtitle: 'O Tanque que Venceu o Front Oriental',
    category: 'tanks',
    faction: 'União Soviética',
    year: '1940 - 1945',
    specs: {
      caliberOrEngine: 'Motor V-2 diesel 12 cilindros (500 hp)',
      rateOrSpeed: '53 km/h (suspensão Christie)',
      range: 'Canhão F-34 de 76,2 mm',
      weightOrCrew: '26 a 32 toneladas (4 tripulantes)',
    },
    acousticCuriosity: 'Chocalho áspero do motor diesel e rangido rápido das esteiras largas de aço, projetadas para não atolar na lama da "Raspútitsa" russa.',
    historicalContext: 'Combinava três pilares revolucionários: blindagem inclinada, alta mobilidade com esteiras largas e canhão potente de 76 mm. Produzido em mais de 84.000 unidades.',
    tacticalTrenchRole: 'Esmagava trincheiras inimigas passando por cima dos parapeitos e destruindo ninhos de metralhadoras com fogo direto e suas esteiras pesadas.',
    soundAction: 't34',
  },
  {
    id: 'sherman',
    name: 'M4 Sherman',
    subtitle: 'Blindado Médio Aliado de Produção em Massa',
    category: 'tanks',
    faction: 'Aliados (EUA/GB)',
    year: '1942 - 1955',
    specs: {
      caliberOrEngine: 'Continental R975 radial a gasolina (400 hp)',
      rateOrSpeed: '40 a 48 km/h',
      range: 'Canhão 75 mm M3 / 76 mm M1',
      weightOrCrew: '30 toneladas (5 tripulantes)',
    },
    acousticCuriosity: 'Zumbido contínuo do motor radial semelhante a um avião em terra firme, e o martelar veloz da metralhadora pesada Browning .50 na cúpula.',
    historicalContext: 'Construído em ritmo frenético nos estaleiros e fábricas automotivas americanas. Extremamente confiável mecanicamente e fácil de reparar no campo de batalha.',
    tacticalTrenchRole: 'Suporte direto de fogo à infantaria em avanço, disparando projéteis de alto-explosivo (HE) e fumaça para proteger tropas assaltando trincheiras.',
    soundAction: 'sherman',
  },

  // EXPLOSÕES E ARTILHARIA
  {
    id: 'katyusha',
    name: 'Lançador de Foguetes Katyusha (BM-13)',
    subtitle: 'O "Órgão de Stálin" (Stalinorgel)',
    category: 'artillery',
    faction: 'União Soviética',
    year: '1941 - 1945',
    specs: {
      caliberOrEngine: 'Foguetes M-13 de 132 mm (16 trilhos)',
      rateOrSpeed: 'Salva completa de 16 foguetes em 7 a 10 segundos',
      range: 'Alcance de 8,5 km',
      weightOrCrew: 'Montado em caminhão Studebaker US6 / ZIS-6',
    },
    acousticCuriosity: 'Os trilhos de lançamento geravam um silvo agudo polifônico semelhante aos tubos de um órgão de igreja — daí o apelido "Órgão de Stálin" dado pelas tropas alemãs em pânico nas trincheiras.',
    historicalContext: 'Lançadores múltiplos móveis que compensavam a falta de pontaria com choque psicológico extremo e saturação completa de áreas em questão de segundos.',
    tacticalTrenchRole: 'Bombardeio de choque devastador antes de ofensivas do Exército Vermelho, obliterando concentrações de tropas em trincheiras abertas.',
    soundAction: 'katyusha',
  },
  {
    id: 'howitzer105',
    name: 'Obus M2A1 / leFH 18 de 105 mm',
    subtitle: 'Artilharia Pesada de Campanha',
    category: 'artillery',
    faction: 'Aliados (EUA/GB)',
    year: '1935 - 1950',
    specs: {
      caliberOrEngine: '105 mm Obus de alto-explosivo',
      rateOrSpeed: '3 a 6 disparos por minuto',
      range: 'Alcance de até 11.200 m',
      weightOrCrew: '2.260 kg (8 serventes)',
    },
    acousticCuriosity: 'O som viaja em duas fases: primeiro o rugido distante do cano quilômetros atrás, depois o zunido rasgante do ar comprimido e a explosão de terra que chacoalha o interior do abrigo.',
    historicalContext: 'A artilharia foi a maior responsável por baixas na Segunda Guerra Mundial (mais de 60% dos soldados feridos ou mortos foram vítimas de estilhaços de artilharia).',
    tacticalTrenchRole: 'Barragem contínua para enterrar vivos os defensores, destruir parapeitos de sacos de areia e criar crateras no campo de batalha.',
    soundAction: 'howitzer105',
  },
  {
    id: 'naval-bombardment',
    name: 'Bombardeio Naval (Canhões de 14 e 16 polegadas)',
    subtitle: 'Fogo dos Couraçados Aliados no Dia D',
    category: 'artillery',
    faction: 'Aliados (EUA/GB)',
    year: '1944 (Operação Netuno)',
    specs: {
      caliberOrEngine: 'Canhões de 356 mm a 406 mm',
      rateOrSpeed: '2 disparos por minuto por cano',
      range: 'Alcance de mais de 35 km mar adentro',
      weightOrCrew: 'Couraçados USS Nevada, HMS Warspite, USS Texas',
    },
    acousticCuriosity: 'Ouvido como ondas de choque de trovão subsônico que reverberavam por dezenas de quilômetros na costa da Normandia, com projéteis do tamanho de carros (mais de 1 tonelada).',
    historicalContext: 'Na manhã de 6 de junho de 1944, a frota aliada lançou milhares de toneladas de aço e explosivo contra as fortificações costeiras e trincheiras da Muralha do Atlântico.',
    tacticalTrenchRole: 'Pulverização de baterias de artilharia e casamatas de concreto fortemente enterradas em penhascos e falésias.',
    soundAction: 'navalBombardment',
  },
  {
    id: 'grenade',
    name: 'Granada de Mão (Stielhandgranate / Mk 2 Pineapple)',
    subtitle: 'Arma de Fragmentação para Assalto a Abrigos',
    category: 'artillery',
    faction: 'Eixo (Alemanha)',
    year: '1939 - 1945',
    specs: {
      caliberOrEngine: 'Carga explosiva TNT com jaqueta de fragmentação',
      rateOrSpeed: 'Retardo de 4,5 segundos no pavio',
      range: 'Arremesso de 30 a 40 metros',
      weightOrCrew: '500 g a 600 g (infantaria)',
    },
    acousticCuriosity: 'O estalo metálico do pino ou puxada da corda interna do cabo de madeira, seguido pelo chiado do pavio pirotécnico e o estilhaço estrondoso no ambiente fechado da trincheira.',
    historicalContext: 'O modelo alemão Stielhandgranate 24 com cabo de madeira funcionava como alavanca de arremesso, permitindo lançamentos mais distantes que as granadas ovais aliadas.',
    tacticalTrenchRole: 'Limpeza essencial de curvas cegas em trincheiras (bunkers subterrâneos e ninhos de metralhadora) onde o tiro direto era impossível.',
    soundAction: 'grenade',
  },
];

export const BATTLE_SCENARIOS: BattleScenario[] = [
  {
    id: 'stalingrad',
    title: 'Batalha de Stalingrado (1942–1943)',
    year: 'Setembro 1942 – Fevereiro 1943',
    location: 'Rio Volga, URSS',
    image: stalingradImg,
    summary: 'A virada definitiva do front oriental em um combate brutal entre escombros de fábricas, trincheiras escavadas em crateras de bombas e o inverno soviético implacável.',
    trenchType: 'Trincheiras Urbanas & Galerias em Ruínas Industriais ("Rattenkrieg")',
    tacticalConditions: [
      'Temperaturas extremas de até -35°C congelando lubrificantes de armas',
      'Distâncias de combate minúsculas (muitas vezes menos de 15 metros entre prédios)',
      'Salvas incessantes de Katyushas e morteiros soviéticos',
      'Atiradores de elite (snipers) vigiando cada fenda de tijolo',
    ],
    historicalNarrative: 'Em Stalingrado, a infantaria lutou sala por sala e porão por porão. Os alemães chamaram a luta de "Rattenkrieg" (Guerra dos Ratos). As trincheiras não eram escavadas em campos abertos, mas ligavam porões de fábricas bombardeadas e crateras de obuses na neve.',
    suggestedAmbience: {
      rain: false,
      wind: true,
      distantWar: true,
      radio: true,
      weapons: ['mg42', 'kar98k', 'mortar', 'katyusha'],
    },
  },
  {
    id: 'normandy',
    title: 'Normandia: Dia D & Bocage (1944)',
    year: 'Junho – Julho de 1944',
    location: 'Normandia, França',
    image: normandyImg,
    summary: 'O desembarque aliado nas praias e o avanço claustrofóbico através do "Bocage": labirinto de sebes vivas milenares fortificadas com trincheiras alemãs e ninhos de MG 42.',
    trenchType: 'Trincheiras de Sebes Vivas (Bocage) e Bunkers Costeiros',
    tacticalConditions: [
      'Chuva e lama constante nas estradas afundadas francesas',
      'Visibilidade reduzida a menos de 50 metros devido à vegetação densa',
      'Bombardeio naval pesado e apoio constante de caças Spitfire e P-47',
      'Emboscadas com canhões antitanque 88 mm camuflados nas raízes',
    ],
    historicalNarrative: 'Após romperem as praias do Dia D, as tropas aliadas depararam-se com o pesadelo do Bocage normando. Cada sebe de arbustos e terra espessa de 2 metros de altura era uma fortaleza natural com trincheiras interligadas. Tanques Sherman precisaram de "dentes" soldados na frente (Rhino) para rasgar a vegetação.',
    suggestedAmbience: {
      rain: true,
      wind: true,
      distantWar: true,
      radio: true,
      weapons: ['m1garand', 'mg42', 'spitfire', 'stuka', 'howitzer105'],
    },
  },
  {
    id: 'monte-castelo',
    title: 'Batalha de Monte Castelo (1944–1945)',
    year: 'Novembro 1944 – Fevereiro 1945',
    location: 'Apeninos Setentrionais, Itália',
    image: monteCasteloImg,
    summary: 'O heroico batismo de fogo e a vitória da Força Expedicionária Brasileira (FEB) nas trincheiras gélidas da Linha Gótica alemã nos Montes Apeninos.',
    trenchType: 'Dugouts Montanhosos e Trincheiras em Solo Rochoso Congelado',
    tacticalConditions: [
      'Inverno mais rigoroso da Europa em décadas, com soldados brasileiros enfrentando neve constante',
      'Inimigo fortificado no cume com visão privilegiada de qualquer aproximação',
      'Artilharia de morteiros alemães castigando as ravinas e encostas sem cobertura',
      'Uso intensivo de fuzis M1 Garand, submetralhadoras Thompson e morteiros aliados',
    ],
    historicalNarrative: 'A 1ª Divisão de Infantaria Expedicionária Brasileira recebeu a missão de tomar Monte Castelo, posição-chave para o avanço aliado em direção a Bolonha. Após quatro ataques repelidos sob fogo cerrado de metralhadoras e morteiros na neve, em 21 de fevereiro de 1945 os "Pracinhas" brasileiros conquistaram o pico em uma ação heroica que marcou a história militar nacional.',
    suggestedAmbience: {
      rain: false,
      wind: true,
      distantWar: true,
      radio: true,
      weapons: ['m1garand', 'thompson', 'mortar', 'howitzer105'],
    },
  },
  {
    id: 'ardennes',
    title: 'Batalha do Bulge / Ardenas (1944–1945)',
    year: 'Dezembro 1944 – Janeiro 1945',
    location: 'Florestas das Ardenas, Bélgica e Luxemburgo',
    image: trenchPanoramicImg,
    summary: 'A última grande contraofensiva de Hitler no front ocidental. Paraquedistas e infantaria americana cercados em trincheiras geladas nas florestas sob bombardeio de estilhaços nas árvores.',
    trenchType: 'Foxholes (Covas de Raposa) em Floresta de Pinheiros Coberta de Neve',
    tacticalConditions: [
      'Céu permanentemente encoberto por nevoeiro espesso nos primeiros dias, impedindo apoio aéreo',
      'Estilhaços no ar causados por projéteis explodindo no topo dos pinheiros (Tree Bursts)',
      'Ataques surpresa de divisões Panzer com tanques pesados Tiger e Panther',
      'Falta crítica de suprimentos de inverno e rações aquecidas',
    ],
    historicalNarrative: 'Em Bastogne e nas florestas das Ardenas, os soldados entrincheirados em covas rasas cavadas na terra congelada enfrentaram o frio de -20°C e a fúria das divisões blindadas alemãs. Sem apoio aéreo inicial devido ao mau tempo, as trincheiras florestais tornaram-se o palco de uma resistência tenaz até a chegada dos reforços de Patton.',
    suggestedAmbience: {
      rain: false,
      wind: true,
      distantWar: true,
      radio: false,
      weapons: ['m1garand', 'mg42', 'mortar', 'tiger1', 'howitzer105'],
    },
  },
];

export const TRENCH_LIFE_TOPICS = [
  {
    id: 'evolution',
    title: 'Da 1ª para a 2ª Guerra: A Evolução das Trincheiras',
    description: 'Na 1ª Guerra (1914–1918), as trincheiras eram linhas estáticas contínuas de centenas de quilômetros na Europa Ocidental. Já na 2ª Guerra (1939–1945), a doutrina Blitzkrieg com tanques velozes e apoio aéreo tornou trincheiras estáticas vulneráveis a cerco. As trincheiras tornaram-se "posições fortificadas elásticas": foxholes (covas de raposa dispersas), ninhos fortificados interligados por valas de comunicação, casamatas de concreto (Muralha do Atlântico) e redutos defensivos para emboscadas de curto alcance.',
  },
  {
    id: 'sanitary',
    title: 'Condições Sanitárias & o Temido "Pé de Trincheira"',
    description: 'A umidade constante, a lama e o frio causavam a temida síndrome do "pé de trincheira" (trench foot) — necrose tecidual e infecções graves causadas pela exposição prolongada a meias encharcadas e temperaturas baixas sem circulação sanguínea. Os soldados precisavam revezar meias secas e usar graxa de baleia ou óleos impermeabilizantes. Ratos, piolhos e a escassez de água potável completavam a dura rotina diária.',
  },
  {
    id: 'acoustics',
    title: 'A Ciência Acústica do Campo de Batalha',
    description: 'O som era o primeiro e mais vital sentido de sobrevivência para o soldado na trincheira. O cérebro aprendia a calcular a distância pelo atraso entre o clarão e o estrondo (cerca de 340 metros por segundo). Um assobio agudo de morteiro que aumentava de tom significava que a queda estava na vertical exata do soldado. O zumbido do Stuka causava taquicardia induzida, enquanto o som contínuo da MG 42 ensinava a infantaria a não erguer a cabeça por mais de 2 segundos.',
  },
  {
    id: 'psychology',
    title: 'O Impacto Psicológico: Fadiga de Combate & "Shell Shock"',
    description: 'Dias e noites inteiras sob bombardeio contínuo de artilharia pesada causavam abalo neurológico e psicológico severo. A impossibilidade de contra-atacar enquanto se aguardava um impacto aleatório no abrigo levava à tremedeira incontrolável, surdez temporária, cegueira histérica e esgotamento mental. Médicos militares da época passaram a reconhecer o trauma como "Combat Exhaustion" (Fadiga de Combate).',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Qual fuzil de infantaria dos EUA ficava famoso pelo som metálico característico ("ping") ao terminar seu carregador de 8 tiros?',
    soundAction: 'm1garand',
    options: ['Karabiner 98k', 'M1 Garand', 'Lee-Enfield', 'Mosin-Nagant'],
    correctIndex: 1,
    explanation: 'O M1 Garand utilizava um clipe em bloco de 8 munições que era automaticamente ejetado para cima quando a última bala era disparada, gerando uma ressonância acústica metálica em ~2400 Hz.',
    historicalFact: 'O M1 Garand permitia uma cadência de fogo muito superior aos fuzis de ferrolho manual comuns na Wehrmacht e no Exército Vermelho.',
  },
  {
    id: 2,
    question: 'Por qual motivo o bombardeiro alemão Ju 87 "Stuka" emitia um uivo ensurdecedor durante o mergulho?',
    soundAction: 'stuka',
    options: [
      'Falha aerodinâmica nos flaps de asa',
      'Sirenes acionadas pelo ar nos trens de pouso ("Trombeta de Jericó") para pavor psicológico',
      'Injeção de óxido nitroso nos canos de escape',
      'Giroscópio do leme traseiro superaquecido',
    ],
    correctIndex: 1,
    explanation: 'As "Trombetas de Jericó" eram pequenas hélices conectadas a sirenes montadas nas pernas do trem de pouso do Stuka para gerar pânico e desorientação nas trincheiras.',
    historicalFact: 'Mais tarde na guerra, à medida que a superioridade aérea aliada aumentou, as sirenes foram removidas porque reduziam ligeiramente a velocidade máxima do avião.',
  },
  {
    id: 3,
    question: 'Por que a metralhadora alemã MG 42 era apelidada pelos soldados de "A Serra de Hitler"?',
    soundAction: 'mg42',
    options: [
      'Possuía lâminas cortantes na boca do cano',
      'Sua altíssima cadência (1200+ tiros/min) fazia os tiros soarem como um zumbido contínuo de serra',
      'Foi desenvolvida em uma fábrica de madeira na Baviera',
      'Cortava árvores para fazer pontes',
    ],
    correctIndex: 1,
    explanation: 'Com cerca de 20 a 25 disparos por segundo, o cérebro humano não distingue os disparos individuais, fundindo o som em uma textura contínua e rasgante.',
    historicalFact: 'O manual de treinamento do exército americano alertava os recrutas de que o som aterrorizante da MG 42 era pior que sua precisão real.',
  },
  {
    id: 4,
    question: 'Qual arma soviética de saturação em salvas de foguetes ganhou o apelido alemão de "Órgão de Stálin"?',
    soundAction: 'katyusha',
    options: ['Katyusha (BM-13)', 'Tanque KV-2', 'Canhão antitanque ZiS-3', 'Morteiro de 120 mm'],
    correctIndex: 0,
    explanation: 'O Katyusha disparava até 16 foguetes M-13 em menos de 10 segundos a partir de trilhos paralelos, criando um uivo polifônico assustador.',
    historicalFact: 'A montagem em caminhões permitia que a bateria disparasse sua salva devastadora e mudasse de posição imediatamente antes da resposta da contra-artilharia alemã.',
  },
  {
    id: 5,
    question: 'Na Batalha de Monte Castelo (1944–1945), que força militar aliada lutou nas trincheiras de montanha na Itália sob severo inverno?',
    soundAction: 'mortar',
    options: [
      'Legião Estrangeira Francesa',
      'Força Expedicionária Brasileira (FEB)',
      'Exército Imperial Australiano',
      'Corpo Expedicionário Polonês em Narvik',
    ],
    correctIndex: 1,
    explanation: 'A FEB, carinhosamente conhecida como "Os Pracinhas", participou ativamente da Campanha da Itália e conquistou o estratégico Monte Castelo em 21 de fevereiro de 1945.',
    historicalFact: 'O lema da FEB era "A cobra vai fumar!", em resposta aos céticos que diziam que era mais fácil uma cobra fumar do que o Brasil entrar na guerra.',
  },
];
