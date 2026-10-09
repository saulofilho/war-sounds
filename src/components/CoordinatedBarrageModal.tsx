import React, { useState } from 'react';
import { X, Flame, Play, Square, Layers, Sparkles } from 'lucide-react';
import { soundEngine } from '../services/audioEngine';

interface CoordinatedBarrageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoordinatedBarrageModal: React.FC<CoordinatedBarrageModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');

  if (!isOpen) return null;

  const runPreset = (presetName: string) => {
    soundEngine.ensureRunning();
    setIsPlaying(true);

    if (presetName === 'normandy') {
      setCurrentStep('Fase 1: Bombardeio Naval Pesado offshore (Canhões de 16 pol)...');
      soundEngine.playNavalBombardment();

      setTimeout(() => {
        setCurrentStep('Fase 2: Caças Spitfire em varredura rasante com metralhadoras...');
        soundEngine.playSpitfire(-0.8, 0.8);
      }, 2500);

      setTimeout(() => {
        setCurrentStep('Fase 3: Resposta dos ninhos alemães com rajadas de MG 42...');
        soundEngine.playMG42(1.5, 'mid', 0.4);
      }, 5000);

      setTimeout(() => {
        setCurrentStep('Fase 4: Artilharia de obuses de 105 mm detonando no parapeito...');
        soundEngine.playArtilleryBlast('near', -0.2);
      }, 7200);

      setTimeout(() => {
        setCurrentStep('Simulação concluída.');
        setIsPlaying(false);
      }, 9500);
    } else if (presetName === 'stalingrad') {
      setCurrentStep('Fase 1: Salva fulminante de foguetes soviéticos Katyusha...');
      soundEngine.playKatyushaSalvo(12, -0.4);

      setTimeout(() => {
        setCurrentStep('Fase 2: Avanço de blindados T-34 rugindo sobre os escombros...');
        soundEngine.playT34('mid', 0.2);
      }, 3000);

      setTimeout(() => {
        setCurrentStep('Fase 3: Morteiros soviéticos atingindo posições alemãs...');
        soundEngine.playMortar('near', -0.3);
      }, 5500);

      setTimeout(() => {
        setCurrentStep('Fase 4: Fogo cerrado de rifles Kar98k e snipers...');
        soundEngine.playKar98k('near', 0.5);
      }, 8000);

      setTimeout(() => {
        setCurrentStep('Simulação concluída.');
        setIsPlaying(false);
      }, 10000);
    } else if (presetName === 'stuka-tiger') {
      setCurrentStep('Fase 1: Junkers Ju 87 Stuka mergulha com a Sirene Jericho...');
      soundEngine.playStukaDive('near', 0);

      setTimeout(() => {
        setCurrentStep('Fase 2: Tanque pesado Tiger I avança e dispara seu canhão 88 mm...');
        soundEngine.playTigerI(true, 'mid', 0.3);
      }, 4500);

      setTimeout(() => {
        setCurrentStep('Fase 3: Rajadas defensivas e estilhaços...');
        soundEngine.playMG42(1.0, 'near', -0.4);
      }, 7500);

      setTimeout(() => {
        setCurrentStep('Simulação concluída.');
        setIsPlaying(false);
      }, 9500);
    } else if (presetName === 'monte-castelo') {
      setCurrentStep('Fase 1: Morteiros aliados castigando o cume da montanha...');
      soundEngine.playMortar('mid', -0.3);

      setTimeout(() => {
        setCurrentStep('Fase 2: Obuses pesados de 105 mm abrindo crateras na rocha...');
        soundEngine.playArtilleryBlast('far', 0.2);
      }, 2400);

      setTimeout(() => {
        setCurrentStep('Fase 3: Infantaria da FEB avançando com fuzis M1 Garand...');
        soundEngine.playM1Garand(8, true, 'near', 0);
      }, 4800);

      setTimeout(() => {
        setCurrentStep('Fase 4: Fogo de supressão com Thompson .45...');
        soundEngine.playThompson(10, 'near', -0.2);
      }, 7200);

      setTimeout(() => {
        setCurrentStep('Simulação concluída.');
        setIsPlaying(false);
      }, 9500);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentStep('Interrompido pelo operador.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-xl border border-stone-700 bg-stone-900 p-6 shadow-2xl text-stone-100 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-stone-100 transition-colors"
          title="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 mb-1">
            <Flame className="h-4 w-4" />
            <span>Simulador de Batalha Orquestrada</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-stone-100">
            Bombardeio Coordenado da Trincheira
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            Escolha uma sequência orquestrada de armas, artilharia e apoio aéreo para vivenciar a sobreposição acústica e o choque sensorial de uma batalha em tempo real.
          </p>
        </div>

        {/* Current status display */}
        <div className="p-4 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-stone-500 block">Status da Sequência</span>
            <span className="text-xs sm:text-sm font-mono text-amber-400 font-semibold">
              {currentStep || 'Selecione uma simulação abaixo para iniciar.'}
            </span>
          </div>
          {isPlaying && (
            <button
              onClick={handleStop}
              className="flex items-center gap-1.5 rounded bg-rose-900 hover:bg-rose-800 text-stone-100 px-3 py-1.5 text-xs font-semibold transition-colors shrink-0"
            >
              <Square className="h-3 w-3 fill-current" />
              <span>Parar</span>
            </button>
          )}
        </div>

        {/* Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Preset 1: Normandy */}
          <div className="p-4 rounded-lg bg-stone-950/60 border border-stone-800 hover:border-stone-700 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-display text-sm font-bold text-stone-100">
                Ofensiva da Normandia (Dia D)
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Bombardeio naval pesado offshore, caças Spitfire em rasante, metralhadoras MG 42 e obuses de 105 mm.
              </p>
            </div>
            <button
              disabled={isPlaying}
              onClick={() => runPreset('normandy')}
              className="w-full flex items-center justify-center gap-2 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold py-2 text-xs transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-stone-950" />
              <span>Executar Sequência</span>
            </button>
          </div>

          {/* Preset 2: Stalingrad */}
          <div className="p-4 rounded-lg bg-stone-950/60 border border-stone-800 hover:border-stone-700 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-display text-sm font-bold text-stone-100">
                Tempestade de Stalingrado
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Salvas de foguetes Katyusha, avanço de tanques T-34 soviéticos, morteiros e atiradores Kar98k.
              </p>
            </div>
            <button
              disabled={isPlaying}
              onClick={() => runPreset('stalingrad')}
              className="w-full flex items-center justify-center gap-2 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold py-2 text-xs transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-stone-950" />
              <span>Executar Sequência</span>
            </button>
          </div>

          {/* Preset 3: Stuka & Tiger */}
          <div className="p-4 rounded-lg bg-stone-950/60 border border-stone-800 hover:border-stone-700 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-display text-sm font-bold text-stone-100">
                Blitzkrieg: Mergulho Stuka & Tiger I
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Uivo aterrador da Trombeta de Jericó do bombardeiro Stuka seguido pelo troar do canhão 88 mm do tanque Tiger.
              </p>
            </div>
            <button
              disabled={isPlaying}
              onClick={() => runPreset('stuka-tiger')}
              className="w-full flex items-center justify-center gap-2 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold py-2 text-xs transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-stone-950" />
              <span>Executar Sequência</span>
            </button>
          </div>

          {/* Preset 4: Monte Castelo FEB */}
          <div className="p-4 rounded-lg bg-stone-950/60 border border-stone-800 hover:border-stone-700 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-display text-sm font-bold text-stone-100">
                Assalto a Monte Castelo (FEB)
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Morteiros nas ravinas gélidas dos Apeninos, obuses de 105 mm e assalto com fuzis M1 Garand e submetralhadoras Thompson.
              </p>
            </div>
            <button
              disabled={isPlaying}
              onClick={() => runPreset('monte-castelo')}
              className="w-full flex items-center justify-center gap-2 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold py-2 text-xs transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-stone-950" />
              <span>Executar Sequência</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
