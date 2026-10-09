import React, { useState } from 'react';
import { Play, Info, Search, Filter, ShieldCheck, Crosshair, Plane, ShieldAlert, Bomb } from 'lucide-react';
import { SOUND_ITEMS, SoundItem } from '../data/ww2HistoricalData';
import { soundEngine } from '../services/audioEngine';

interface ArsenalMuseumViewProps {
  onOpenDetails: (item: SoundItem) => void;
}

export const ArsenalMuseumView: React.FC<ArsenalMuseumViewProps> = ({ onOpenDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [factionFilter, setFactionFilter] = useState<'all' | 'Aliados (EUA/GB)' | 'Eixo (Alemanha)' | 'União Soviética' | 'Brasil (FEB)'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'weapons' | 'planes' | 'tanks' | 'artillery'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredItems = SOUND_ITEMS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.historicalContext.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFaction = factionFilter === 'all' || item.faction === factionFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesFaction && matchesCategory;
  });

  const handlePlaySound = (item: SoundItem) => {
    soundEngine.ensureRunning();
    setPlayingId(item.id);

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

    setTimeout(() => {
      setPlayingId((curr) => (curr === item.id ? null : curr));
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-stone-800 pb-6">
        <div className="flex items-center gap-2 text-xs text-amber-500 mb-1">
          <span>Acervo Militar da Segunda Guerra</span>
          <span aria-hidden="true">·</span>
          <span>Catálogo Técnico & Acústico</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-100 text-balance">
          Museu do Armamento & Tecnologia de Combate
        </h2>
        <p className="mt-2 text-sm text-stone-300 max-w-3xl leading-relaxed">
          Explore fichas técnicas completas, doutrina militar e as propriedades sonoras de cada arma de infantaria, avião de mergulho, tanque blindado e peça de artilharia que definiram a guerra de trincheiras de 1939 a 1945.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-stone-900 border border-stone-800">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Pesquisar por arma, avião, calibre ou história..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Faction Selectors */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFactionFilter('all')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              factionFilter === 'all'
                ? 'bg-amber-600 text-stone-100 font-semibold'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200'
            }`}
          >
            Todas as Facções
          </button>
          <button
            onClick={() => setFactionFilter('Aliados (EUA/GB)')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              factionFilter === 'Aliados (EUA/GB)'
                ? 'bg-amber-600 text-stone-100 font-semibold'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200'
            }`}
          >
            Aliados
          </button>
          <button
            onClick={() => setFactionFilter('Eixo (Alemanha)')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              factionFilter === 'Eixo (Alemanha)'
                ? 'bg-amber-600 text-stone-100 font-semibold'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200'
            }`}
          >
            Eixo
          </button>
          <button
            onClick={() => setFactionFilter('União Soviética')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              factionFilter === 'União Soviética'
                ? 'bg-amber-600 text-stone-100 font-semibold'
                : 'bg-stone-950 text-stone-400 hover:text-stone-200'
            }`}
          >
            URSS
          </button>
        </div>
      </div>

      {/* Item List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isPlaying = playingId === item.id;
          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-stone-800 bg-stone-900/60 p-5 hover:border-stone-700 transition-colors"
            >
              <div>
                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                  <span>{item.faction}</span>
                  <span className="font-mono">{item.year}</span>
                </div>

                <h3 className="font-display text-lg font-bold text-stone-100">
                  {item.name}
                </h3>
                <p className="text-xs text-amber-500 mt-0.5 mb-3">{item.subtitle}</p>

                <p className="text-xs text-stone-300 leading-relaxed line-clamp-3 mb-4">
                  {item.historicalContext}
                </p>

                {/* Specs Box */}
                <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800 text-xs space-y-1 text-stone-300">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Calibre/Motor:</span>
                    <span className="font-mono text-stone-200">{item.specs.caliberOrEngine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Alcance:</span>
                    <span className="font-mono text-stone-200">{item.specs.range}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handlePlaySound(item)}
                  className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                    isPlaying
                      ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400'
                      : 'bg-stone-800 hover:bg-amber-600 text-stone-100'
                  }`}
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{isPlaying ? 'Emitindo...' : 'Ouvir Som'}</span>
                </button>

                <button
                  onClick={() => onOpenDetails(item)}
                  className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition-colors"
                >
                  <Info className="h-3.5 w-3.5" />
                  <span>Ver Ficha Completa</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
