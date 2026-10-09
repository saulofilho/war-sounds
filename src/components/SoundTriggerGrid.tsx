import React from 'react';
import {
  Play,
  Info,
  ShieldAlert,
  Crosshair,
  Plane,
  Bomb,
  Headphones,
  Zap,
  Volume2,
  Waves,
} from 'lucide-react';
import { SOUND_ITEMS, SoundItem } from '../data/ww2HistoricalData';
import { AcousticEnvironment } from '../services/audioEngine';

interface SoundTriggerGridProps {
  category: 'all' | 'weapons' | 'planes' | 'tanks' | 'artillery';
  onCategoryChange: (cat: 'all' | 'weapons' | 'planes' | 'tanks' | 'artillery') => void;
  onPlaySound: (item: SoundItem) => void;
  onOpenDetails: (item: SoundItem) => void;
  activePlayingId: string | null;
  distance: 'near' | 'mid' | 'far';
  onDistanceChange: (dist: 'near' | 'mid' | 'far') => void;
  pan: number;
  onPanChange: (pan: number) => void;
  isBinaural: boolean;
  onToggleBinaural: () => void;
  firingMode: 'burst' | 'single';
  onFiringModeChange: (mode: 'burst' | 'single') => void;
  acousticPreset: AcousticEnvironment;
  onAcousticPresetChange: (preset: AcousticEnvironment) => void;
  reverbMix: number;
  onReverbMixChange: (val: number) => void;
}

export const SoundTriggerGrid: React.FC<SoundTriggerGridProps> = ({
  category,
  onCategoryChange,
  onPlaySound,
  onOpenDetails,
  activePlayingId,
  distance,
  onDistanceChange,
  pan,
  onPanChange,
  isBinaural,
  onToggleBinaural,
  firingMode,
  onFiringModeChange,
  acousticPreset,
  onAcousticPresetChange,
  reverbMix,
  onReverbMixChange,
}) => {
  const filteredItems = SOUND_ITEMS.filter((item) => {
    if (category === 'all') return true;
    return item.category === category;
  });

  const getCategoryIcon = (cat: SoundItem['category']) => {
    switch (cat) {
      case 'weapons':
        return <Crosshair className="h-4 w-4 text-amber-400" />;
      case 'planes':
        return <Plane className="h-4 w-4 text-sky-400" />;
      case 'tanks':
        return <ShieldAlert className="h-4 w-4 text-emerald-400" />;
      case 'artillery':
        return <Bomb className="h-4 w-4 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sound Controls Header: Category Tabs & Acoustic Parameters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-900/90 rounded-lg border border-stone-800">
          <button
            onClick={() => onCategoryChange('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              category === 'all'
                ? 'bg-amber-600 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            Todos os Sons ({SOUND_ITEMS.length})
          </button>
          <button
            onClick={() => onCategoryChange('weapons')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              category === 'weapons'
                ? 'bg-amber-600 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Crosshair className="h-3.5 w-3.5" />
            Armas de Infantaria
          </button>
          <button
            onClick={() => onCategoryChange('planes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              category === 'planes'
                ? 'bg-amber-600 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Plane className="h-3.5 w-3.5" />
            Aviação de Guerra
          </button>
          <button
            onClick={() => onCategoryChange('tanks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              category === 'tanks'
                ? 'bg-amber-600 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Blindados & Tanques
          </button>
          <button
            onClick={() => onCategoryChange('artillery')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              category === 'artillery'
                ? 'bg-amber-600 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Bomb className="h-3.5 w-3.5" />
            Artilharia & Explosões
          </button>
        </div>

        {/* Spatial Acoustic Settings & Firing Mode */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300">
          {/* Impulse Response Reverb Environment Preset */}
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <Waves className="h-3.5 w-3.5" />
              Reverberação:
            </span>
            <div className="flex items-center p-0.5 bg-stone-900 border border-stone-800 rounded">
              <button
                onClick={() => onAcousticPresetChange('trenchMud')}
                className={`px-2 py-1 rounded transition-colors ${
                  acousticPreset === 'trenchMud'
                    ? 'bg-amber-600 text-stone-100 font-semibold shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Trincheira de terra úmida, tábuas de madeira e sacos de areia (RT60: 2.4s)"
              >
                Trincheira Real
              </button>
              <button
                onClick={() => onAcousticPresetChange('bunkerConcrete')}
                className={`px-2 py-1 rounded transition-colors ${
                  acousticPreset === 'bunkerConcrete'
                    ? 'bg-amber-600 text-stone-100 font-semibold shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Bunker de concreto armado fechado com forte confinamento metálico"
              >
                Bunker
              </button>
              <button
                onClick={() => onAcousticPresetChange('openCraterField')}
                className={`px-2 py-1 rounded transition-colors ${
                  acousticPreset === 'openCraterField'
                    ? 'bg-amber-600 text-stone-100 font-semibold shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Terra de Ninguém / Campo aberto com eco profundo rolando no horizonte"
              >
                Campo Aberto
              </button>
            </div>
          </div>

          {/* Reverb Intensity / Wet mix */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400">Profundidade:</span>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={reverbMix}
              onChange={(e) => onReverbMixChange(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-stone-800 accent-amber-500 rounded cursor-pointer"
              title="Ajuste do ganho da reverberação por convolução da trincheira"
            />
            <span className="font-mono text-[11px] text-stone-400">
              {Math.round(reverbMix * 100)}%
            </span>
          </div>

          {/* Firing Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400">Cadência:</span>
            <div className="flex items-center p-0.5 bg-stone-900 border border-stone-800 rounded">
              <button
                onClick={() => onFiringModeChange('burst')}
                className={`px-2 py-1 rounded transition-colors ${
                  firingMode === 'burst'
                    ? 'bg-stone-700 text-amber-400 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Rajada completa com todas as munições"
              >
                Rajada
              </button>
              <button
                onClick={() => onFiringModeChange('single')}
                className={`px-2 py-1 rounded transition-colors ${
                  firingMode === 'single'
                    ? 'bg-stone-700 text-amber-400 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Tiro único ou rajada curta controlada"
              >
                Tiro (1x)
              </button>
            </div>
          </div>

          {/* Distance Filter */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400">Distância:</span>
            <div className="flex items-center p-0.5 bg-stone-900 border border-stone-800 rounded">
              <button
                onClick={() => onDistanceChange('near')}
                className={`px-2 py-1 rounded transition-colors ${
                  distance === 'near'
                    ? 'bg-stone-700 text-stone-100 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Próximo da trincheira (<50m)"
              >
                50m
              </button>
              <button
                onClick={() => onDistanceChange('mid')}
                className={`px-2 py-1 rounded transition-colors ${
                  distance === 'mid'
                    ? 'bg-stone-700 text-stone-100 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Terra de Ninguém (300m)"
              >
                300m
              </button>
              <button
                onClick={() => onDistanceChange('far')}
                className={`px-2 py-1 rounded transition-colors ${
                  distance === 'far'
                    ? 'bg-stone-700 text-stone-100 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Horizonte distante (3km)"
              >
                3km
              </button>
            </div>
          </div>

          {/* Binaural 3D Headphone mode */}
          <button
            onClick={onToggleBinaural}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border transition-colors ${
              isBinaural
                ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300 font-semibold'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Ativar modelo espacial 3D HRTF (Head-Related Transfer Function) para fones de ouvido"
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>3D HRTF {isBinaural ? 'Ativo' : 'Desativado'}</span>
          </button>

          {/* 3D Trench Sector Presets & Pan */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">Direção 3D:</span>
            <div className="flex items-center p-0.5 bg-stone-900 border border-stone-800 rounded">
              <button
                onClick={() => onPanChange(-0.8)}
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  pan <= -0.5
                    ? 'bg-stone-700 text-amber-400 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Flanco Esquerdo da Trincheira (-75°)"
              >
                Flanco Esq
              </button>
              <button
                onClick={() => onPanChange(0)}
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  Math.abs(pan) < 0.3
                    ? 'bg-stone-700 text-amber-400 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Frente / Linhas Inimigas em Terra de Ninguém (0°)"
              >
                Frente (0°)
              </button>
              <button
                onClick={() => onPanChange(0.8)}
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  pan >= 0.5
                    ? 'bg-stone-700 text-amber-400 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Flanco Direito da Trincheira (+75°)"
              >
                Flanco Dir
              </button>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={pan}
              onChange={(e) => onPanChange(parseFloat(e.target.value))}
              className="w-14 h-1.5 bg-stone-800 accent-amber-500 rounded cursor-pointer ml-1"
              title="Ajuste fino do azimute 3D do PannerNode (-90° a +90°)"
            />
            <span className="font-mono text-[11px] text-stone-400 w-8 text-right">
              {pan > 0 ? `+${Math.round(pan * 90)}°` : `${Math.round(pan * 90)}°`}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Sound Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isPlaying = activePlayingId === item.id;
          return (
            <div
              key={item.id}
              className={`group relative flex flex-col justify-between rounded-lg border p-4 transition-all ${
                isPlaying
                  ? 'border-amber-500 bg-stone-900/95 shadow-lg shadow-amber-950/40'
                  : 'border-stone-800/90 bg-stone-900/50 hover:border-stone-700 hover:bg-stone-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                  <span className="flex items-center gap-1.5 font-medium text-stone-300">
                    {getCategoryIcon(item.category)}
                    {item.category === 'weapons' && 'Infantaria'}
                    {item.category === 'planes' && 'Aviação'}
                    {item.category === 'tanks' && 'Blindado'}
                    {item.category === 'artillery' && 'Artilharia'}
                  </span>
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <span>{item.faction}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{item.year}</span>
                  </div>
                </div>

                <h3 className="font-display text-base font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                  {item.subtitle}
                </p>

                <p className="mt-3 text-xs text-stone-300 leading-relaxed line-clamp-2 italic border-l-2 border-stone-700 pl-2.5">
                  "{item.acousticCuriosity}"
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-stone-800/60">
                <button
                  onClick={() => onPlaySound(item)}
                  className={`flex items-center gap-2 rounded px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                    isPlaying
                      ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400'
                      : 'bg-stone-800 text-stone-100 hover:bg-amber-600 hover:text-stone-100'
                  }`}
                >
                  <Play className={`h-3.5 w-3.5 ${isPlaying ? 'fill-stone-950 animate-pulse' : 'fill-current'}`} />
                  <span>{isPlaying ? 'Emitindo Som...' : 'Executar Som'}</span>
                </button>

                <button
                  onClick={() => onOpenDetails(item)}
                  className="flex items-center gap-1.5 rounded px-2.5 py-2 text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800/70 transition-colors"
                  title="Ver ficha histórica completa e dados técnicos"
                >
                  <Info className="h-3.5 w-3.5" />
                  <span>Ficha Histórica</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
