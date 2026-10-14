import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Menu,
  X,
  Crosshair,
  Sliders,
  MapPin,
  Shield,
  BookOpen,
  Award,
} from 'lucide-react';
import { soundEngine } from '../services/audioEngine';
import { trenchAppIconImg } from '../data/ww2HistoricalData';

export type NavTab = 'soldier' | 'simulator' | 'scenarios' | 'arsenal' | 'trench-life' | 'quiz';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  mobileLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isLive?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'soldier',
    label: 'Soldado 1ª Pessoa',
    mobileLabel: '1ª Pessoa',
    description: 'Imersão em primeira pessoa na linha de frente',
    icon: Crosshair,
    isLive: true,
  },
  {
    id: 'simulator',
    label: 'Simulador Sonoro',
    mobileLabel: 'Simulador',
    description: 'Mesa acústica com armas, blindados e artilharia',
    icon: Sliders,
  },
  {
    id: 'scenarios',
    label: 'Cenários de Guerra',
    mobileLabel: 'Cenários',
    description: 'Frentes históricas de Stalingrado, Normandia e FEB',
    icon: MapPin,
  },
  {
    id: 'arsenal',
    label: 'Museu de Armas',
    mobileLabel: 'Arsenal',
    description: 'Fichas técnicas e áudio de armamentos da 2ª GM',
    icon: Shield,
  },
  {
    id: 'trench-life',
    label: 'Vida na Trincheira',
    mobileLabel: 'Trincheiras',
    description: 'Aspectos humanos, médicos e táticos das defesas',
    icon: BookOpen,
  },
  {
    id: 'quiz',
    label: 'Desafio Acústico',
    mobileLabel: 'Quiz',
    description: 'Teste seu ouvido reconhecendo sons históricos',
    icon: Award,
  },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isMuted,
  onToggleMute,
  volume,
  onChangeVolume,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800 bg-stone-950/95 backdrop-blur-md">
      {/* Primary Header Row */}
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-3 sm:gap-6 px-3 sm:px-6 lg:px-8">
        {/* Zone 1: Brand / Logo */}
        <button
          onClick={() => handleNavClick('soldier')}
          className="flex items-center gap-2 sm:gap-2.5 text-left text-stone-100 transition-opacity hover:opacity-90 shrink-0 min-w-0"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-stone-900 border border-stone-700/80 overflow-hidden shadow-sm shrink-0">
            <img
              src={trenchAppIconImg}
              alt="Trincheira 1944"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display text-base sm:text-lg font-bold tracking-wider text-amber-400 truncate">
              TRINCHEIRA 1944
            </span>
            <span className="hidden sm:inline text-[10px] text-stone-400 tracking-tight -mt-1 font-mono">
              SIMULADOR SONORO HISTÓRICO
            </span>
          </div>
        </button>

        {/* Zone 2: Desktop Navigation Links (Only on lg+ to prevent any line wrap or overlap) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs xl:text-sm font-medium">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`whitespace-nowrap px-2.5 py-1.5 transition-colors flex items-center gap-1.5 rounded-md ${
                  isActive
                    ? 'text-amber-400 font-semibold bg-stone-900 border-b-2 border-amber-500'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-900/60'
                }`}
              >
                {item.isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Audio Controls & Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Master Volume Slider (Hidden on small mobile to guarantee zero overlap) */}
          <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-md bg-stone-900/80 border border-stone-800">
            <span className="text-[11px] text-stone-400 font-mono">Vol</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeVolume(val);
                soundEngine.setMasterVolume(val);
              }}
              className="h-1.5 w-16 sm:w-20 cursor-pointer accent-amber-500 rounded bg-stone-800"
              aria-label="Controle de Volume Master"
            />
            <span className="text-[10px] text-stone-400 font-mono w-7 text-right">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>

          {/* Mute Button */}
          <button
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              isMuted
                ? 'border-red-900/60 bg-red-950/50 text-red-400 hover:bg-red-900/40'
                : 'border-stone-700 bg-stone-900 text-stone-200 hover:border-stone-600 hover:bg-stone-800'
            }`}
            title={isMuted ? 'Ativar Áudio' : 'Silenciar Todo o Áudio'}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 text-red-400 shrink-0" />
                <span className="hidden sm:inline text-[11px]">Mudo</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="hidden sm:inline text-[11px]">Áudio Ativo</span>
              </>
            )}
          </button>

          {/* Mobile/Tablet Menu Hamburger Button (Visible below lg) */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            className="lg:hidden p-2 rounded-lg border border-stone-800 bg-stone-900 text-stone-300 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Fast Tab Bar (Always visible below lg for fast 1-tap switching without layout breaks) */}
      <div className="lg:hidden flex items-center overflow-x-auto border-t border-stone-800/80 bg-stone-950 px-2 sm:px-4 py-1.5 gap-1.5 text-xs font-medium scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-600/20 text-amber-400 font-semibold border border-amber-600/40'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              {item.isLive && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              )}
              <span>{item.mobileLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Full Dropdown Menu (Opened when clicking Hamburger) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-800 bg-stone-950/98 backdrop-blur-xl px-4 py-4 space-y-3 shadow-2xl animate-fade-in">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 pb-1 border-b border-stone-800">
            Módulos do Aplicativo
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                    isActive
                      ? 'border-amber-500/60 bg-amber-950/20 text-stone-100 shadow-sm'
                      : 'border-stone-800/80 bg-stone-900/60 text-stone-300 hover:bg-stone-900 hover:border-stone-700'
                  }`}
                >
                  <div
                    className={`p-2 rounded-md shrink-0 ${
                      isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-semibold text-sm">
                      <span className={isActive ? 'text-amber-400' : 'text-stone-100'}>
                        {item.label}
                      </span>
                      {item.isLive && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 font-mono border border-red-800/60">
                          AO VIVO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mobile Master Volume Slider inside Drawer */}
          <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-300">
            <span className="font-mono text-stone-400">Volume do Simulador:</span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onChangeVolume(val);
                  soundEngine.setMasterVolume(val);
                }}
                className="h-2 w-32 cursor-pointer accent-amber-500 rounded bg-stone-800"
              />
              <span className="font-mono text-amber-400 w-10 text-right">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
