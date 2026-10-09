import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TrenchSimulator } from './components/TrenchSimulator';
import { BattleScenariosView } from './components/BattleScenariosView';
import { ArsenalMuseumView } from './components/ArsenalMuseumView';
import { TrenchLifeView } from './components/TrenchLifeView';
import { AcousticQuizView } from './components/AcousticQuizView';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CoordinatedBarrageModal } from './components/CoordinatedBarrageModal';
import { SoundItem } from './data/ww2HistoricalData';
import { soundEngine } from './services/audioEngine';
import { Volume2, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'scenarios' | 'arsenal' | 'trench-life' | 'quiz'>('simulator');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [selectedItemForModal, setSelectedItemForModal] = useState<SoundItem | null>(null);
  const [isBarrageModalOpen, setIsBarrageModalOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Initialize audio engine on first user interaction
  const handleUserInteraction = () => {
    if (!hasInteracted) {
      soundEngine.init();
      setHasInteracted(true);
    }
  };

  useEffect(() => {
    const unlockAudio = () => {
      soundEngine.init();
      setHasInteracted(true);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const handleToggleMute = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleChangeVolume = (vol: number) => {
    setVolume(vol);
    soundEngine.setMasterVolume(vol);
  };

  return (
    <div
      onClick={handleUserInteraction}
      className="min-h-screen flex flex-col bg-stone-950 text-stone-100 selection:bg-amber-800 selection:text-stone-100"
    >
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        volume={volume}
        onChangeVolume={handleChangeVolume}
      />

      {/* Main View Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'simulator' && (
          <TrenchSimulator
            onOpenDetails={(item) => setSelectedItemForModal(item)}
            onOpenBarrageModal={() => setIsBarrageModalOpen(true)}
          />
        )}

        {activeTab === 'scenarios' && <BattleScenariosView />}

        {activeTab === 'arsenal' && (
          <ArsenalMuseumView
            onOpenDetails={(item) => setSelectedItemForModal(item)}
          />
        )}

        {activeTab === 'trench-life' && <TrenchLifeView />}

        {activeTab === 'quiz' && <AcousticQuizView />}
      </main>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
      />

      {/* Coordinated Barrage Modal */}
      <CoordinatedBarrageModal
        isOpen={isBarrageModalOpen}
        onClose={() => setIsBarrageModalOpen(false)}
      />

      {/* Clean, Non-ornamental Footer */}
      <footer className="border-t border-stone-800 bg-stone-950/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-stone-400">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-amber-500">TRINCHEIRA 1944</span>
            <span aria-hidden="true">·</span>
            <span>Simulador Sonoro e Museu Didático da Segunda Guerra Mundial</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>Síntese Sonora via Web Audio API</span>
            <span aria-hidden="true">·</span>
            <span>Homenagem aos Veteranos e à FEB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
