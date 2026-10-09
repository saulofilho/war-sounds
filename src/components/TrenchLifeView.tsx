import React from 'react';
import { BookOpen, Shield, HeartPulse, Ear, Zap, Compass } from 'lucide-react';
import { TRENCH_LIFE_TOPICS } from '../data/ww2HistoricalData';

export const TrenchLifeView: React.FC = () => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'evolution':
        return <Compass className="h-5 w-5 text-amber-500" />;
      case 'sanitary':
        return <HeartPulse className="h-5 w-5 text-rose-500" />;
      case 'acoustics':
        return <Ear className="h-5 w-5 text-sky-500" />;
      case 'psychology':
        return <Zap className="h-5 w-5 text-amber-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-stone-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-stone-800 pb-6">
        <div className="flex items-center gap-2 text-xs text-amber-500 mb-1">
          <span>Museu Histórico & Didática Militar</span>
          <span aria-hidden="true">·</span>
          <span>A Condição Humana na Guerra</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-100 text-balance">
          A Vida na Trincheira na 2ª Guerra Mundial
        </h2>
        <p className="mt-2 text-sm text-stone-300 max-w-3xl leading-relaxed">
          Embora a Segunda Guerra Mundial tenha ficado famosa pela velocidade mecanizada da Blitzkrieg, milhões de soldados passaram semanas e meses confinados em trincheiras, covas de raposa (foxholes) e abrigos subterrâneos. Conheça as realidades sanitárias, psicológicas e táticas dessa experiência.
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TRENCH_LIFE_TOPICS.map((topic) => (
          <div
            key={topic.id}
            className="flex flex-col justify-between rounded-xl border border-stone-800 bg-stone-900/60 p-6 hover:border-stone-700 transition-colors"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-950 border border-stone-800">
                  {getIcon(topic.id)}
                </div>
                <h3 className="font-display text-base font-bold text-stone-100">
                  {topic.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {topic.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
              <span>Módulo Didático de História Militar</span>
              <span className="font-mono">WWII 1939-1945</span>
            </div>
          </div>
        ))}
      </div>

      {/* Comparative Deep Dive: 1ª Guerra vs 2ª Guerra */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/80 p-6 space-y-4">
        <h3 className="font-display text-lg font-bold text-stone-100">
          Quadro Comparativo Didático: Trincheiras da 1ª vs 2ª Guerra Mundial
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-stone-950/60 border border-stone-800 space-y-2">
            <h4 className="font-semibold text-amber-400 text-sm">
              1ª Guerra Mundial (1914–1918)
            </h4>
            <ul className="space-y-1.5 text-stone-300">
              <li>• Linhas contínuas e estáticas de centenas de quilômetros (Frente Ocidental).</li>
              <li>• Sistema de 3 linhas paralelas fixas: Frente, Apoio e Reserva.</li>
              <li>• Assaltos frontais suicidas através da "Terra de Ninguém" contra arame farpado.</li>
              <li>• Armas químicas em larga escala (gás mostarda, cloro, fosgênio).</li>
              <li>• Meses na mesma posição geográfica sem movimento de tropas.</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-stone-950/60 border border-stone-800 space-y-2">
            <h4 className="font-semibold text-amber-400 text-sm">
              2ª Guerra Mundial (1939–1945)
            </h4>
            <ul className="space-y-1.5 text-stone-300">
              <li>• Redutos defensivos flexíveis, dispersos e temporários (Foxholes, Bocage, Fortificações).</li>
              <li>• Cooperação integrada de armas combinadas: blindados, infantaria e aviação tática de mergulho.</li>
              <li>• Bunkers de concreto armado com espessuras de até 3 metros (Muralha do Atlântico).</li>
              <li>• Trincheiras urbanas escavadas em ruínas de cidades bombardeadas (Stalingrado, Berlim).</li>
              <li>• Trincheiras com armas antitanque para emboscadas de curto alcance (Panzerfaust, Bazooka).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
