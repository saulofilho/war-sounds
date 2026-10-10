import React from 'react';
import { Volume2, VolumeX, Radio } from 'lucide-react';
import { soundEngine } from '../services/audioEngine';
import { trenchAppIconImg } from '../data/ww2HistoricalData';

interface HeaderProps {
  activeTab: 'simulator' | 'scenarios' | 'arsenal' | 'trench-life' | 'quiz';
  onSelectTab: (tab: 'simulator' | 'scenarios' | 'arsenal' | 'trench-life' | 'quiz') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isMuted,
  onToggleMute,
  volume,
  onChangeVolume,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800 bg-stone-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => onSelectTab('simulator')}
          className="flex items-center gap-2.5 text-left text-stone-100 transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 border border-stone-700/80 overflow-hidden shadow-sm">
            <img
              src={trenchAppIconImg}
              alt="Trincheira 1944"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-wider text-amber-400">
              TRINCHEIRA 1944
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Single-line, unboxed text links) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('simulator')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'simulator'
                ? 'text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Simulador Sonoro
          </button>
          <button
            onClick={() => onSelectTab('scenarios')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'scenarios'
                ? 'text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Cenários de Batalha
          </button>
          <button
            onClick={() => onSelectTab('arsenal')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'arsenal'
                ? 'text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Museu do Armamento
          </button>
          <button
            onClick={() => onSelectTab('trench-life')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'trench-life'
                ? 'text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Vida na Trincheira
          </button>
          <button
            onClick={() => onSelectTab('quiz')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'quiz'
                ? 'text-amber-400 border-b-2 border-amber-500 font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Desafio Acústico
          </button>
        </nav>

        {/* Zone 3: Primary Action & Audio Control */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-stone-400">Volume</span>
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
              className="h-1.5 w-20 cursor-pointer accent-amber-500 rounded bg-stone-800"
              aria-label="Controle de Volume Master"
            />
          </div>

          <button
            onClick={onToggleMute}
            className={`flex items-center gap-2 rounded border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              isMuted
                ? 'border-red-900/60 bg-red-950/40 text-red-400 hover:bg-red-900/30'
                : 'border-stone-700 bg-stone-900 text-stone-200 hover:border-stone-600 hover:bg-stone-800'
            }`}
            title={isMuted ? 'Ativar Áudio' : 'Silenciar'}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 text-red-400" />
                <span>Mudo</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-amber-400" />
                <span>Áudio Ativo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile subnavigation bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-stone-800 px-4 py-2 gap-4 text-xs font-medium scrollbar-none">
        <button
          onClick={() => onSelectTab('simulator')}
          className={`whitespace-nowrap shrink-0 ${
            activeTab === 'simulator' ? 'text-amber-400 font-semibold' : 'text-stone-400'
          }`}
        >
          Simulador
        </button>
        <button
          onClick={() => onSelectTab('scenarios')}
          className={`whitespace-nowrap shrink-0 ${
            activeTab === 'scenarios' ? 'text-amber-400 font-semibold' : 'text-stone-400'
          }`}
        >
          Cenários
        </button>
        <button
          onClick={() => onSelectTab('arsenal')}
          className={`whitespace-nowrap shrink-0 ${
            activeTab === 'arsenal' ? 'text-amber-400 font-semibold' : 'text-stone-400'
          }`}
        >
          Armamentos
        </button>
        <button
          onClick={() => onSelectTab('trench-life')}
          className={`whitespace-nowrap shrink-0 ${
            activeTab === 'trench-life' ? 'text-amber-400 font-semibold' : 'text-stone-400'
          }`}
        >
          Trincheiras
        </button>
        <button
          onClick={() => onSelectTab('quiz')}
          className={`whitespace-nowrap shrink-0 ${
            activeTab === 'quiz' ? 'text-amber-400 font-semibold' : 'text-stone-400'
          }`}
        >
          Desafio
        </button>
      </div>
    </header>
  );
};
