import React, { useState } from 'react';
import { Play, MapPin, Calendar, Shield, Flame, Radio, Volume2 } from 'lucide-react';
import { BATTLE_SCENARIOS, BattleScenario } from '../data/ww2HistoricalData';
import { soundEngine } from '../services/audioEngine';

export const BattleScenariosView: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<BattleScenario>(BATTLE_SCENARIOS[0]);
  const [isPlayingScenario, setIsPlayingScenario] = useState(false);

  const handleSimulateScenario = (scenario: BattleScenario) => {
    soundEngine.ensureRunning();
    setIsPlayingScenario(true);

    // Set ambient layers
    soundEngine.setRain(scenario.suggestedAmbience.rain);
    soundEngine.setWind(scenario.suggestedAmbience.wind);
    soundEngine.setDistantWar(scenario.suggestedAmbience.distantWar);
    soundEngine.setRadio(scenario.suggestedAmbience.radio);

    // Fire an orchestrated barrage of representative sounds for this battle
    const weapons = scenario.suggestedAmbience.weapons;
    weapons.forEach((weapon, index) => {
      setTimeout(() => {
        switch (weapon) {
          case 'm1garand':
            soundEngine.playM1Garand(8, true, 'near', -0.3);
            break;
          case 'mg42':
            soundEngine.playMG42(1.4, 'mid', 0.4);
            break;
          case 'kar98k':
            soundEngine.playKar98k('near', 0.2);
            break;
          case 'mortar':
            soundEngine.playMortar('mid', -0.4);
            break;
          case 'stuka':
            soundEngine.playStukaDive('mid', 0);
            break;
          case 'katyusha':
            soundEngine.playKatyushaSalvo(8, -0.6);
            break;
          case 'tiger1':
            soundEngine.playTigerI(true, 'far', 0.5);
            break;
          case 'howitzer105':
            soundEngine.playArtilleryBlast('near', 0.1);
            break;
          case 'spitfire':
            soundEngine.playSpitfire(-0.6, 0.6);
            break;
          case 'thompson':
            soundEngine.playThompson(8, 'near', -0.2);
            break;
        }
      }, index * 1800);
    });

    setTimeout(() => {
      setIsPlayingScenario(false);
    }, weapons.length * 1800 + 1000);
  };

  const handleStopScenarioAmbience = () => {
    soundEngine.stopAllAmbience();
    setIsPlayingScenario(false);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-stone-800 pb-6">
        <div className="flex items-center gap-2 text-xs text-amber-500 mb-1">
          <span>Acervo Histórico Interativo</span>
          <span aria-hidden="true">·</span>
          <span>Frentes de Combate 1942–1945</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-100 text-balance">
          Cenários Históricos de Trincheiras na 2ª Guerra
        </h2>
        <p className="mt-2 text-sm text-stone-300 max-w-3xl leading-relaxed">
          Explore as condições reais das fortificações de trincheiras em diferentes teatros de operações da Segunda Guerra Mundial.
          Cada cenário apresenta ambiente climático, armas típicas e características geográficas recriadas acusticamente.
        </p>
      </div>

      {/* Scenario Selector Carousel / Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BATTLE_SCENARIOS.map((scenario) => {
          const isSelected = selectedScenario.id === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario)}
              className={`group flex flex-col overflow-hidden rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-amber-500 bg-stone-900 ring-1 ring-amber-500 shadow-xl'
                  : 'border-stone-800 bg-stone-900/60 hover:border-stone-700 hover:bg-stone-900'
              }`}
            >
              <div className="h-32 w-full overflow-hidden bg-stone-950 relative">
                <img
                  src={scenario.image}
                  alt={scenario.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[11px] font-mono text-stone-300 bg-stone-950/80 px-2 py-0.5 rounded">
                  {scenario.year}
                </span>
              </div>
              <div className="p-3.5 space-y-1">
                <h3 className="font-display text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                  {scenario.title}
                </h3>
                <p className="text-xs text-stone-400 line-clamp-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span>{scenario.location}</span>
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Spotlight */}
      <div className="overflow-hidden rounded-xl border border-stone-800 bg-stone-900 shadow-xl">
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden">
          <img
            src={selectedScenario.image}
            alt={selectedScenario.title}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-black/30" />

          <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-amber-400 mb-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{selectedScenario.location}</span>
                <span aria-hidden="true">·</span>
                <Calendar className="h-3.5 w-3.5" />
                <span>{selectedScenario.year}</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-stone-100">
                {selectedScenario.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-1">
                {selectedScenario.trenchType}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleSimulateScenario(selectedScenario)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-lg ${
                  isPlayingScenario
                    ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400 animate-pulse'
                    : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                }`}
              >
                <Play className="h-4 w-4 fill-stone-950" />
                <span>{isPlayingScenario ? 'Simulando Cenário...' : 'Iniciar Simulação Sonora Deste Cenário'}</span>
              </button>

              {isPlayingScenario && (
                <button
                  onClick={handleStopScenarioAmbience}
                  className="rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2.5 text-xs font-medium transition-colors"
                >
                  Interromper
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Narrative & Tactical Conditions */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-stone-800">
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Narrativa Histórica & Guerra de Posição
            </h4>
            <p className="text-sm text-stone-300 leading-relaxed">
              {selectedScenario.historicalNarrative}
            </p>
            <div className="p-4 rounded-lg bg-stone-950/60 border border-stone-800">
              <span className="text-xs text-stone-400 block mb-1">Síntese Estratégica:</span>
              <p className="text-xs text-stone-200 leading-relaxed italic">
                "{selectedScenario.summary}"
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Condições Táticas da Trincheira
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              {selectedScenario.tacticalConditions.map((cond, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{cond}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-stone-800 text-xs text-stone-400">
              <span className="block mb-1 font-semibold text-stone-300">Camadas Acústicas Recomendadas:</span>
              <div className="flex flex-wrap gap-1 text-[11px]">
                {selectedScenario.suggestedAmbience.rain && (
                  <span className="px-2 py-0.5 bg-stone-800 rounded">Chuva constante</span>
                )}
                {selectedScenario.suggestedAmbience.wind && (
                  <span className="px-2 py-0.5 bg-stone-800 rounded">Vento gélido</span>
                )}
                {selectedScenario.suggestedAmbience.distantWar && (
                  <span className="px-2 py-0.5 bg-stone-800 rounded">Artilharia distante</span>
                )}
                {selectedScenario.suggestedAmbience.radio && (
                  <span className="px-2 py-0.5 bg-stone-800 rounded">Rádio e código Morse</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
