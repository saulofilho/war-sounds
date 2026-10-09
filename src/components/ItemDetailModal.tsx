import React from 'react';
import { X, Play, BookOpen, Volume2, Shield, Crosshair, Wrench, Calendar, Compass } from 'lucide-react';
import { SoundItem } from '../data/ww2HistoricalData';
import { soundEngine } from '../services/audioEngine';

interface ItemDetailModalProps {
  item: SoundItem | null;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const handlePlay = () => {
    soundEngine.ensureRunning();
    switch (item.soundAction) {
      case 'm1garand':
        soundEngine.playM1Garand(8, true, 'near', 0);
        break;
      case 'mg42':
        soundEngine.playMG42(1.2, 'near', 0);
        break;
      case 'kar98k':
        soundEngine.playKar98k('near', 0);
        break;
      case 'thompson':
        soundEngine.playThompson(8, 'near', 0);
        break;
      case 'mortar':
        soundEngine.playMortar('near', 0);
        break;
      case 'stuka':
        soundEngine.playStukaDive('near', 0);
        break;
      case 'spitfire':
        soundEngine.playSpitfire(-0.6, 0.6);
        break;
      case 'b17':
        soundEngine.playB17Formation();
        break;
      case 'tiger1':
        soundEngine.playTigerI(true, 'near', 0);
        break;
      case 't34':
        soundEngine.playT34('near', 0);
        break;
      case 'sherman':
        soundEngine.playSherman('near', 0);
        break;
      case 'katyusha':
        soundEngine.playKatyushaSalvo(10, 0);
        break;
      case 'howitzer105':
        soundEngine.playArtilleryBlast('near', 0);
        break;
      case 'navalBombardment':
        soundEngine.playNavalBombardment();
        break;
      case 'grenade':
        soundEngine.playGrenade('near', 0);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-stone-700 bg-stone-900 p-6 shadow-2xl text-stone-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-stone-100 transition-colors"
          title="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Metadata */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <span>{item.faction}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{item.year}</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-stone-100">
            {item.name}
          </h2>
          <p className="text-sm text-stone-400">{item.subtitle}</p>
        </div>

        {/* Quick Audio Trigger Strip */}
        <div className="mt-4 flex items-center justify-between gap-4 p-3.5 bg-stone-950/70 border border-stone-800 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-stone-300">
            <Volume2 className="h-4 w-4 text-amber-500" />
            <span>Ouça a assinatura sonora gerada via Web Audio API:</span>
          </div>
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-4 py-2 text-xs transition-colors shrink-0"
          >
            <Play className="h-3.5 w-3.5 fill-stone-950" />
            <span>Disparar Áudio</span>
          </button>
        </div>

        {/* Technical Specs Grid */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
            Ficha Técnica Operacional
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-950/50 border border-stone-800 rounded">
              <span className="text-stone-400 block mb-1">Calibre / Motorização:</span>
              <span className="font-medium text-stone-200">{item.specs.caliberOrEngine}</span>
            </div>
            <div className="p-3 bg-stone-950/50 border border-stone-800 rounded">
              <span className="text-stone-400 block mb-1">Cadência / Velocidade:</span>
              <span className="font-medium text-stone-200">{item.specs.rateOrSpeed}</span>
            </div>
            <div className="p-3 bg-stone-950/50 border border-stone-800 rounded">
              <span className="text-stone-400 block mb-1">Alcance Efetivo:</span>
              <span className="font-medium text-stone-200">{item.specs.range}</span>
            </div>
            <div className="p-3 bg-stone-950/50 border border-stone-800 rounded">
              <span className="text-stone-400 block mb-1">Peso / Guarnição:</span>
              <span className="font-medium text-stone-200">{item.specs.weightOrCrew}</span>
            </div>
          </div>
        </div>

        {/* Acoustic Curiosity */}
        <div className="mt-6 p-4 rounded-lg border border-amber-900/40 bg-amber-950/20 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
            <Volume2 className="h-4 w-4" />
            <span>Física Acústica & Impacto Psicológico na Trincheira</span>
          </div>
          <p className="text-stone-300 leading-relaxed mt-1">
            {item.acousticCuriosity}
          </p>
        </div>

        {/* Tactical Role & Historical Context */}
        <div className="mt-6 space-y-4 text-xs text-stone-300">
          <div>
            <span className="font-semibold text-stone-200 block mb-1">
              Papel Tático na Guerra de Trincheiras:
            </span>
            <p className="leading-relaxed text-stone-400">
              {item.tacticalTrenchRole}
            </p>
          </div>

          <div>
            <span className="font-semibold text-stone-200 block mb-1">
              Contexto Histórico Geral:
            </span>
            <p className="leading-relaxed text-stone-400">
              {item.historicalContext}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
