import React, { useState, useEffect, useRef } from 'react';
import {
  CloudRain,
  Wind,
  Radio,
  Flame,
  Volume2,
  VolumeX,
  Eye,
  Sliders,
  Sparkles,
  Activity,
  Layers,
  Headphones,
  Zap,
} from 'lucide-react';
import { soundEngine, AcousticEnvironment } from '../services/audioEngine';
import {
  SOUND_ITEMS,
  SoundItem,
  trenchPanoramicImg,
  stalingradImg,
  normandyImg,
  monteCasteloImg,
} from '../data/ww2HistoricalData';
import { SoundTriggerGrid } from './SoundTriggerGrid';

interface TrenchSimulatorProps {
  onOpenDetails: (item: SoundItem) => void;
  onOpenBarrageModal: () => void;
}

type TrenchEnvironment = 'standard' | 'stalingrad' | 'normandy' | 'monte-castelo';

export const TrenchSimulator: React.FC<TrenchSimulatorProps> = ({
  onOpenDetails,
  onOpenBarrageModal,
}) => {
  // Simulator State
  const [environment, setEnvironment] = useState<TrenchEnvironment>('standard');
  const [activeCategory, setActiveCategory] = useState<'all' | 'weapons' | 'planes' | 'tanks' | 'artillery'>('all');
  const [distance, setDistance] = useState<'near' | 'mid' | 'far'>('near');
  const [pan, setPan] = useState<number>(0);
  const [isBinaural, setIsBinaural] = useState<boolean>(true);
  const [firingMode, setFiringMode] = useState<'burst' | 'single'>('burst');
  const [acousticPreset, setAcousticPreset] = useState<AcousticEnvironment>('trenchMud');
  const [reverbMix, setReverbMix] = useState<number>(0.42);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);
  const [lastSoundNotice, setLastSoundNotice] = useState<string>('Pronto para simulação sonora. Clique em qualquer arma ou veículo.');

  // Ambient Layer states
  const [rainActive, setRainActive] = useState(false);
  const [windActive, setWindActive] = useState(false);
  const [distantWarActive, setDistantWarActive] = useState(false);
  const [radioActive, setRadioActive] = useState(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background image mapping
  const envImages: Record<TrenchEnvironment, string> = {
    standard: trenchPanoramicImg,
    stalingrad: stalingradImg,
    normandy: normandyImg,
    'monte-castelo': monteCasteloImg,
  };

  const envTitles: Record<TrenchEnvironment, { title: string; subtitle: string }> = {
    standard: {
      title: 'Posto Fortificado de Linha de Frente',
      subtitle: 'Trincheira profunda com sacos de areia, tábuas de madeira e parapeito de tiro.',
    },
    stalingrad: {
      title: 'Setor Urbano de Stalingrado (Rattenkrieg)',
      subtitle: 'Trincheira entre ruínas de concreto industrial, neve e fumaça contínua.',
    },
    normandy: {
      title: 'Bocage da Normandia (Sebes Fortificadas)',
      subtitle: 'Estrada afundada com parapeitos úmidos camuflados sob chuva copiosa.',
    },
    'monte-castelo': {
      title: 'Apeninos Italianos (Setor FEB / Monte Castelo)',
      subtitle: 'Dugout rochoso escavado na encosta montanhosa sob neve gélida.',
    },
  };

  // Weather animation loop on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const onResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', onResize);

    const particlesCount =
      environment === 'normandy' || rainActive
        ? 120
        : environment === 'stalingrad' || environment === 'monte-castelo'
        ? 70
        : 40;
    const particles = Array.from({ length: particlesCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 12 + 6,
      speed: Math.random() * 4 + 4,
      opacity: Math.random() * 0.4 + 0.2,
      radius: Math.random() * 2 + 1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isSnow = environment === 'stalingrad' || environment === 'monte-castelo';
      const isRain = environment === 'normandy' || rainActive;

      if (isRain) {
        ctx.strokeStyle = 'rgba(200, 220, 255, 0.35)';
        ctx.lineWidth = 1.2;
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2, p.y + p.length);
          ctx.stroke();

          p.y += p.speed * 2.2;
          p.x -= 1.2;
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        });
      } else if (isSnow) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.speed * 0.45;
          p.x += Math.sin(p.y * 0.05) * 0.5;
          if (p.y > height) {
            p.y = -5;
            p.x = Math.random() * width;
          }
        });
      }

      if (distantWarActive) {
        ctx.fillStyle = 'rgba(255, 140, 50, 0.35)';
        for (let i = 0; i < 5; i++) {
          const sparkX = width * 0.3 + Math.random() * 200;
          const sparkY = height * 0.7 - Math.random() * 60;
          ctx.fillRect(sparkX, sparkY, 2, 2);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
    };
  }, [environment, rainActive, distantWarActive]);

  // Real-time Audio Spectrum & Radar visualizer
  useEffect(() => {
    const vCanvas = visualizerCanvasRef.current;
    if (!vCanvas) return;
    const vCtx = vCanvas.getContext('2d');
    if (!vCtx) return;

    let animId: number;
    const bufferLength = soundEngine.analyserNode ? soundEngine.analyserNode.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const drawVisualizer = () => {
      animId = requestAnimationFrame(drawVisualizer);
      if (!soundEngine.analyserNode) {
        vCtx.clearRect(0, 0, vCanvas.width, vCanvas.height);
        return;
      }

      soundEngine.analyserNode.getByteFrequencyData(dataArray);

      vCtx.clearRect(0, 0, vCanvas.width, vCanvas.height);
      const barWidth = (vCanvas.width / (bufferLength * 0.6));
      let x = 0;

      for (let i = 0; i < bufferLength * 0.6; i++) {
        const barHeight = (dataArray[i] / 255) * vCanvas.height;
        const alpha = Math.min(1, Math.max(0.2, dataArray[i] / 200));

        vCtx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
        vCtx.fillRect(x, vCanvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    drawVisualizer();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  // Ambience toggles
  const handleToggleRain = () => {
    const next = !rainActive;
    setRainActive(next);
    soundEngine.setRain(next);
  };

  const handleToggleWind = () => {
    const next = !windActive;
    setWindActive(next);
    soundEngine.setWind(next);
  };

  const handleToggleDistantWar = () => {
    const next = !distantWarActive;
    setDistantWarActive(next);
    soundEngine.setDistantWar(next);
  };

  const handleToggleRadio = () => {
    const next = !radioActive;
    setRadioActive(next);
    soundEngine.setRadio(next);
  };

  const handleToggleBinaural = () => {
    const next = soundEngine.toggleBinauralMode();
    setIsBinaural(next);
  };

  const handleAcousticPresetChange = (preset: AcousticEnvironment) => {
    setAcousticPreset(preset);
    soundEngine.setAcousticEnvironment(preset);
  };

  const handleReverbMixChange = (mix: number) => {
    setReverbMix(mix);
    soundEngine.setReverbMix(mix);
  };

  // Play Sound execution with firing mode respect
  const handlePlaySound = (item: SoundItem) => {
    soundEngine.ensureRunning();
    setActivePlayingId(item.id);
    setLastSoundNotice(`Disparando som de: ${item.name} (${item.subtitle})`);

    // Screen effects
    if (item.category === 'artillery' || item.category === 'tanks') {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
    if (item.category === 'weapons') {
      setShowMuzzleFlash(true);
      setTimeout(() => setShowMuzzleFlash(false), 300);
    }

    switch (item.soundAction) {
      case 'm1garand':
        soundEngine.playM1Garand(firingMode === 'single' ? 1 : 8, firingMode === 'burst', distance, pan);
        break;
      case 'mg42':
        soundEngine.playMG42(firingMode === 'single' ? 0.45 : 1.4, distance, pan);
        break;
      case 'kar98k':
        soundEngine.playKar98k(distance, pan);
        break;
      case 'thompson':
        soundEngine.playThompson(firingMode === 'single' ? 3 : 10, distance, pan);
        break;
      case 'mortar':
        soundEngine.playMortar(distance, pan);
        break;
      case 'stuka':
        soundEngine.playStukaDive(distance, pan);
        break;
      case 'spitfire':
        soundEngine.playSpitfire(pan - 0.4, pan + 0.4);
        break;
      case 'b17':
        soundEngine.playB17Formation();
        break;
      case 'tiger1':
        soundEngine.playTigerI(firingMode === 'burst', distance, pan);
        break;
      case 't34':
        soundEngine.playT34(distance, pan);
        break;
      case 'sherman':
        soundEngine.playSherman(distance, pan);
        break;
      case 'katyusha':
        soundEngine.playKatyushaSalvo(firingMode === 'single' ? 4 : 12, pan);
        break;
      case 'howitzer105':
        soundEngine.playArtilleryBlast(distance, pan);
        break;
      case 'navalBombardment':
        soundEngine.playNavalBombardment();
        break;
      case 'grenade':
        soundEngine.playGrenade(distance === 'near' ? 'near' : 'mid', pan);
        break;
      case 'bulletWhiz':
        soundEngine.playBulletWhiz(pan < -0.2 ? 'left' : pan > 0.2 ? 'right' : 'center');
        break;
    }

    setTimeout(() => {
      setActivePlayingId((curr) => (curr === item.id ? null : curr));
    }, 1500);
  };

  return (
    <div className={`space-y-8 ${isShaking ? 'animate-trench-shake' : ''}`}>
      {/* Hero Visual Trench Diorama */}
      <div className="relative overflow-hidden rounded-xl border border-stone-800 bg-stone-900 shadow-2xl">
        <div className="relative h-80 sm:h-96 md:h-[420px] w-full overflow-hidden">
          <img
            src={envImages[environment]}
            alt={envTitles[environment].title}
            className="h-full w-full object-cover transition-opacity duration-700"
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/30" />

          {/* Canvas weather particles */}
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          {/* Muzzle flash overlay */}
          {showMuzzleFlash && (
            <div className="pointer-events-none absolute inset-0 bg-amber-400/20 mix-blend-screen animate-muzzle-flash" />
          )}

          {/* Trench Periscope Reticle lines */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
            <div className="h-48 w-48 rounded-full border border-stone-400/50 flex items-center justify-center">
              <div className="h-full w-[1px] bg-stone-400/50" />
              <div className="w-full h-[1px] bg-stone-400/50 absolute" />
            </div>
          </div>

          {/* Top Left: Real-time Audio Spectrum & Radar HUD */}
          <div className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-stone-950/85 backdrop-blur-md border border-stone-800 flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-mono flex items-center gap-1">
                <Activity className="h-3 w-3 text-amber-500" />
                Radar Acústico
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {isBinaural ? 'Modo HRTF 3D' : 'Estéreo Padrão'}
              </span>
            </div>
            <canvas
              ref={visualizerCanvasRef}
              width={100}
              height={26}
              className="rounded bg-stone-900 border border-stone-800"
            />
          </div>

          {/* Environment Selector Strip on Top Right */}
          <div className="absolute top-4 right-4 z-10 flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-stone-950/80 backdrop-blur-md border border-stone-800 text-xs">
            <span className="hidden sm:inline px-2 text-stone-400">Posto:</span>
            <button
              onClick={() => setEnvironment('standard')}
              className={`px-2.5 py-1 rounded transition-colors ${
                environment === 'standard'
                  ? 'bg-amber-600 text-stone-100 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Linha Padrão
            </button>
            <button
              onClick={() => setEnvironment('stalingrad')}
              className={`px-2.5 py-1 rounded transition-colors ${
                environment === 'stalingrad'
                  ? 'bg-amber-600 text-stone-100 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Stalingrado
            </button>
            <button
              onClick={() => setEnvironment('normandy')}
              className={`px-2.5 py-1 rounded transition-colors ${
                environment === 'normandy'
                  ? 'bg-amber-600 text-stone-100 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Normandia
            </button>
            <button
              onClick={() => setEnvironment('monte-castelo')}
              className={`px-2.5 py-1 rounded transition-colors ${
                environment === 'monte-castelo'
                  ? 'bg-amber-600 text-stone-100 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Monte Castelo (FEB)
            </button>
          </div>

          {/* Bottom Diorama Overlay: Current Status & Coordinated Simulation CTA */}
          <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-amber-400 mb-1">
                <span>Periscópio Óptico de Trincheira</span>
                <span aria-hidden="true">·</span>
                <span>Visada de 180°</span>
                <span aria-hidden="true">·</span>
                <span>Eco de Solo: Ativo</span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-stone-100 text-balance">
                {envTitles[environment].title}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
                {envTitles[environment].subtitle}
              </p>
              <div className="mt-2 text-xs text-stone-400 font-mono">
                {lastSoundNotice}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  soundEngine.ensureRunning();
                  soundEngine.playBulletWhiz(pan < -0.2 ? 'left' : pan > 0.2 ? 'right' : 'center');
                  setLastSoundNotice('Projétil 7.92mm supersônico cortando o ar a centímetros do capacete (3D PannerNode)!');
                }}
                className="flex items-center gap-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-amber-600/50 font-semibold px-3 py-2 text-xs transition-all shadow-md"
                title="Experimente um projétil supersônico passando zunindo a centímetros da sua cabeça com áudio 3D binaural"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Projétil Rasante (3D)</span>
              </button>
              <button
                onClick={onOpenBarrageModal}
                className="flex items-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2.5 text-xs sm:text-sm transition-all shadow-lg shadow-amber-950/60"
              >
                <Flame className="h-4 w-4 fill-stone-950" />
                <span>Bombardeio Coordenado</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ambient Layers Bar (Chuva, Vento, Artilharia ao Longe, Rádio Militar) */}
        <div className="border-t border-stone-800 bg-stone-950/90 px-4 py-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Layers className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-stone-200">Camadas Contínuas da Trincheira:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Rain */}
              <button
                onClick={handleToggleRain}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs transition-colors ${
                  rainActive
                    ? 'bg-sky-950/80 text-sky-300 border border-sky-700/60 font-semibold'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
                title="Chuva e gotas de lama nas tábuas da trincheira"
              >
                <CloudRain className="h-3.5 w-3.5" />
                <span>Chuva na Lama</span>
                <span className="text-[10px] opacity-75">{rainActive ? 'Ligado' : 'Desligado'}</span>
              </button>

              {/* Wind */}
              <button
                onClick={handleToggleWind}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs transition-colors ${
                  windActive
                    ? 'bg-teal-950/80 text-teal-300 border border-teal-700/60 font-semibold'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
                title="Uivo de vento frio soprando pelos sacos de areia"
              >
                <Wind className="h-3.5 w-3.5" />
                <span>Vento Gélido</span>
                <span className="text-[10px] opacity-75">{windActive ? 'Ligado' : 'Desligado'}</span>
              </button>

              {/* Distant Artillery */}
              <button
                onClick={handleToggleDistantWar}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs transition-colors ${
                  distantWarActive
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60 font-semibold'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
                title="Estrondos randômicos de artilharia pesada distante no horizonte"
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Artilharia no Horizonte</span>
                <span className="text-[10px] opacity-75">{distantWarActive ? 'Ligado' : 'Desligado'}</span>
              </button>

              {/* Field Radio */}
              <button
                onClick={handleToggleRadio}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs transition-colors ${
                  radioActive
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60 font-semibold'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
                title="Estática de rádio militar e sinais de código Morse"
              >
                <Radio className="h-3.5 w-3.5" />
                <span>Rádio de Campanha</span>
                <span className="text-[10px] opacity-75">{radioActive ? 'Ligado' : 'Desligado'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sound Trigger Grid */}
      <SoundTriggerGrid
        category={activeCategory}
        onCategoryChange={setActiveCategory}
        onPlaySound={handlePlaySound}
        onOpenDetails={onOpenDetails}
        activePlayingId={activePlayingId}
        distance={distance}
        onDistanceChange={setDistance}
        pan={pan}
        onPanChange={setPan}
        isBinaural={isBinaural}
        onToggleBinaural={handleToggleBinaural}
        firingMode={firingMode}
        onFiringModeChange={setFiringMode}
        acousticPreset={acousticPreset}
        onAcousticPresetChange={handleAcousticPresetChange}
        reverbMix={reverbMix}
        onReverbMixChange={handleReverbMixChange}
      />
    </div>
  );
};
