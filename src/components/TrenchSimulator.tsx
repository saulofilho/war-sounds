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
} from 'lucide-react';
import { soundEngine } from '../services/audioEngine';
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
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);
  const [lastSoundNotice, setLastSoundNotice] = useState<string>('Pronto para simulação sonora. Clique em qualquer arma ou veículo.');

  // Ambient Layer states
  const [rainActive, setRainActive] = useState(false);
  const [windActive, setWindActive] = useState(false);
  const [distantWarActive, setDistantWarActive] = useState(false);
  const [radioActive, setRadioActive] = useState(false);

  // Canvas ref for weather / particle simulation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    // Particles for rain or snow
    const particlesCount = environment === 'normandy' || rainActive ? 120 : environment === 'stalingrad' || environment === 'monte-castelo' ? 70 : 40;
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

      // Render rain or snow particles
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

      // Distant smoke plume embers
      if (distantWarActive) {
        ctx.fillStyle = 'rgba(255, 140, 50, 0.35)';
        for (let i = 0; i < 5; i++) {
          const sparkX = (width * 0.3) + Math.random() * 200;
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

  // Play Sound execution
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
        soundEngine.playM1Garand(8, true, distance, pan);
        break;
      case 'mg42':
        soundEngine.playMG42(1.2, distance, pan);
        break;
      case 'kar98k':
        soundEngine.playKar98k(distance, pan);
        break;
      case 'thompson':
        soundEngine.playThompson(8, distance, pan);
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
        soundEngine.playTigerI(true, distance, pan);
        break;
      case 't34':
        soundEngine.playT34(distance, pan);
        break;
      case 'sherman':
        soundEngine.playSherman(distance, pan);
        break;
      case 'katyusha':
        soundEngine.playKatyushaSalvo(10, pan);
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
    }

    // Reset active indicator after sound finishes
    setTimeout(() => {
      setActivePlayingId((curr) => (curr === item.id ? null : curr));
    }, 1500);
  };

  return (
    <div className={`space-y-8 ${isShaking ? 'animate-trench-shake' : ''}`}>
      {/* Hero Visual Trench Diorama */}
      <div className="relative overflow-hidden rounded-xl border border-stone-800 bg-stone-900 shadow-2xl">
        <div className="relative h-80 sm:h-96 md:h-[420px] w-full overflow-hidden">
          {/* Background image */}
          <img
            src={envImages[environment]}
            alt={envTitles[environment].title}
            className="h-full w-full object-cover transition-opacity duration-700"
            referrerPolicy="no-referrer"
          />

          {/* Gradients and atmospheric scrim for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/30" />

          {/* Canvas particle weather overlay */}
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          {/* Muzzle Flash Flashbang effect */}
          {showMuzzleFlash && (
            <div className="pointer-events-none absolute inset-0 bg-amber-400/20 mix-blend-screen animate-muzzle-flash" />
          )}

          {/* Trench Periscope Reticle lines */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
            <div className="h-44 w-44 rounded-full border border-stone-400/50 flex items-center justify-center">
              <div className="h-full w-[1px] bg-stone-400/50" />
              <div className="w-full h-[1px] bg-stone-400/50 absolute" />
            </div>
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

            <div className="flex items-center gap-2 shrink-0">
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
      />
    </div>
  );
};
