import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  soldierPovTrenchImg,
  soldierDugoutPovImg,
  soldierNightFlareImg,
} from '../data/ww2HistoricalData';
import { soundEngine } from '../services/audioEngine';
import {
  Volume2,
  VolumeX,
  Eye,
  Maximize2,
  Minimize2,
  Heart,
  Wind,
  CloudRain,
  Flame,
  Radio,
  Sparkles,
  ShieldAlert,
  Crosshair,
  Footprints,
  Compass,
  Bomb,
  Plane,
  ChevronDown,
  ChevronUp,
  Vibrate,
  VibrateOff,
  CloudFog,
} from 'lucide-react';

type TrenchEnvironment = 'parapet-day' | 'night-flare' | 'dugout';

export const SoldierTrenchExperience: React.FC = () => {
  // Current sensory environment
  const [environment, setEnvironment] = useState<TrenchEnvironment>('parapet-day');

  // Sensory states
  const [isCrouched, setIsCrouched] = useState(false);
  const [isTense, setIsTense] = useState(false);
  const [bpm, setBpm] = useState(76);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Visual sensory effects
  const [flashType, setFlashType] = useState<'gun' | 'flare' | 'artillery' | null>(null);
  const [screenShake, setScreenShake] = useState<'none' | 'light' | 'heavy' | 'violent'>('none');
  const [hasTinnitus, setHasTinnitus] = useState(false);
  const [dirtSplatter, setDirtSplatter] = useState(false);
  const [lastActionFeedback, setLastActionFeedback] = useState<string | null>(null);

  // Efeito Visual de Neblina Atmosférica (CSS radial-gradient & opacidade)
  const [atmosphericFog, setAtmosphericFog] = useState(true);
  const [fogDensity, setFogDensity] = useState<'normal' | 'dense'>('normal');

  // Ambient sound layers
  const [ambientRain, setAmbientRain] = useState(true);
  const [ambientWind, setAmbientWind] = useState(true);
  const [ambientArtillery, setAmbientArtillery] = useState(true);
  const [ambientRadio, setAmbientRadio] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const breathTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  // Trigger brief feedback text without explanation (just visceral exclamation)
  const flashFeedback = useCallback((text: string) => {
    setLastActionFeedback(text);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      setLastActionFeedback(null);
    }, 1800);
  }, []);

  // Initialize and maintain ambient sounds when component mounts
  useEffect(() => {
    soundEngine.ensureRunning();
    soundEngine.setRain(ambientRain);
    soundEngine.setWind(ambientWind);
    soundEngine.setDistantWar(ambientArtillery);
    soundEngine.setRadio(ambientRadio);

    return () => {
      soundEngine.stopAllAmbience();
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  // Heartbeat loop matching BPM
  useEffect(() => {
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);

    const intervalMs = (60 / bpm) * 1000;
    heartbeatTimerRef.current = window.setInterval(() => {
      if (isTense || bpm > 95) {
        soundEngine.playHeartbeat();
      }
    }, intervalMs);

    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    };
  }, [bpm, isTense]);

  // Breathing loop
  useEffect(() => {
    if (breathTimerRef.current) clearInterval(breathTimerRef.current);

    const breathInterval = isTense ? 2400 : 4800;
    let isInhale = true;

    breathTimerRef.current = window.setInterval(() => {
      soundEngine.playHeavyBreathing(isInhale);
      isInhale = !isInhale;
    }, breathInterval);

    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, [isTense]);

  // Haptic feedback (Vibration API) for mobile devices
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Trigger tactile vibration feedback for concussive shakes on mobile
  const triggerHaptic = useCallback((intensity: 'light' | 'heavy' | 'violent') => {
    if (!hapticsEnabled) return;
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      try {
        if (intensity === 'violent') {
          // Concussive multi-stage shockwave rumble: near artillery/mortar/Stuka direct impact
          navigator.vibrate([240, 80, 180, 60, 320]);
        } else if (intensity === 'heavy') {
          // Heavy explosive tremor
          navigator.vibrate([180, 60, 140]);
        } else if (intensity === 'light') {
          // Subtle recoil twitch
          navigator.vibrate(30);
        }
      } catch {
        // Gracefully ignore if blocked by device settings or unsupported
      }
    }
  }, [hapticsEnabled]);

  // Handle screen shake trigger with tactile mobile vibration
  const triggerShake = (intensity: 'light' | 'heavy' | 'violent', durationMs: number = 700) => {
    setScreenShake(intensity);
    // Dispara feedback tátil para tremores pesados e violentos
    if (intensity === 'heavy' || intensity === 'violent') {
      triggerHaptic(intensity);
    }
    setTimeout(() => {
      setScreenShake('none');
    }, durationMs);
  };

  // Handle flash trigger
  const triggerFlash = (type: 'gun' | 'flare' | 'artillery', durationMs: number = 180) => {
    setFlashType(type);
    setTimeout(() => {
      setFlashType(null);
    }, durationMs);
  };

  // -------------------------------------------------------------
  // VISCERAL SENSORY ACTIONS
  // -------------------------------------------------------------

  // 1. Fire soldier's rifle from parapet
  const handleFireRifle = useCallback(() => {
    soundEngine.ensureRunning();
    triggerFlash('gun', 120);
    triggerShake('light', 300);
    flashFeedback('💥 TIRO DE FUZIL');

    // Visceral first-person shot: closest possible distance
    soundEngine.playM1Garand(1, false, 'near', 0.1);

    // Heart rate spikes slightly
    setBpm((prev) => Math.min(135, prev + 6));
  }, [flashFeedback]);

  // 2. Fire illumination flare into the sky
  const handleLaunchFlare = useCallback(() => {
    soundEngine.ensureRunning();
    flashFeedback('🚀 SINALIZADOR LANÇADO');
    soundEngine.playFlareLaunch();

    // After 1.4s ascension, flare blooms and switches or illuminates the night scene
    setTimeout(() => {
      triggerFlash('flare', 4500);
      setEnvironment('night-flare');
    }, 1400);
  }, [flashFeedback]);

  // 3. Close supersonic bullet whiz
  const handleBulletWhiz = useCallback(() => {
    soundEngine.ensureRunning();
    const side = Math.random() > 0.5 ? 'left' : 'right';
    soundEngine.playBulletWhiz(side);
    triggerShake('light', 250);
    flashFeedback(side === 'left' ? '⚡ PROJÉTIL RASANTE! (ESQ)' : '⚡ PROJÉTIL RASANTE! (DIR)');

    setIsTense(true);
    setBpm((prev) => Math.min(145, prev + 18));
  }, [flashFeedback]);

  // 4. Mortar shell incoming & explosion
  const handleIncomingMortar = useCallback(() => {
    soundEngine.ensureRunning();
    flashFeedback('🚨 ASSOBIO DE MORTEIRO!');
    setIsTense(true);
    setBpm(130);

    // Whistle and impact in 3D
    soundEngine.playMortar('near', Math.random() * 0.8 - 0.4);

    // Detonation impact at 2.4s
    setTimeout(() => {
      triggerFlash('artillery', 450);
      triggerShake('violent', 1400);
      setDirtSplatter(true);
      setTimeout(() => setDirtSplatter(false), 3800);

      // Dirt on helmet
      soundEngine.playDirtFallingOnHelmet();

      // Shell shock ringing
      setHasTinnitus(true);
      soundEngine.playTinnitus(4.2);
      setTimeout(() => {
        setHasTinnitus(false);
      }, 4200);

      flashFeedback('💥 IMPACTO PRÓXIMO! TERRA E ESTILHAÇOS!');
    }, 2400);
  }, [flashFeedback]);

  // 5. Hand grenade thrown over parapet
  const handleThrowGrenade = useCallback(() => {
    soundEngine.ensureRunning();
    flashFeedback('💣 GRANADA LANÇADA!');
    soundEngine.playGrenade('near', 0.2);

    setTimeout(() => {
      triggerFlash('artillery', 250);
      triggerShake('heavy', 750);
    }, 950);
  }, [flashFeedback]);

  // 6. Stuka dive bomber pass
  const handleStukaDive = useCallback(() => {
    soundEngine.ensureRunning();
    flashFeedback('🦅 STUKA EM MERGULHO!');
    setIsTense(true);
    setBpm(140);
    soundEngine.playStuka();

    // Bomb impact at ~4.5s
    setTimeout(() => {
      triggerFlash('artillery', 500);
      triggerShake('violent', 1600);
      soundEngine.playDirtFallingOnHelmet();
      setDirtSplatter(true);
      setTimeout(() => setDirtSplatter(false), 3000);
    }, 4500);
  }, [flashFeedback]);

  // 7. Heavy Artillery barrage barrage
  const handleArtillerySalvo = useCallback(() => {
    soundEngine.ensureRunning();
    flashFeedback('🔥 BARRAGEM DE ARTILHARIA!');
    triggerShake('heavy', 900);
    triggerFlash('artillery', 300);

    soundEngine.playHowitzer105('near', Math.random() * 0.6 - 0.3);

    setTimeout(() => {
      soundEngine.playArtilleryBlast('near', 0.2);
      triggerShake('violent', 1100);
    }, 800);

    setTimeout(() => {
      soundEngine.playArtilleryBlast('mid', -0.3);
      triggerShake('heavy', 800);
    }, 1800);
  }, [flashFeedback]);

  // 8. Katyusha rocket salvo
  const handleKatyushaSalvo = useCallback(() => {
    soundEngine.ensureRunning();
    flashFeedback('🚀 SALVO DE FOGUETES!');
    soundEngine.playKatyushaSalvo(12, 0);
    triggerShake('heavy', 1200);
  }, [flashFeedback]);

  // 9. Mud footsteps along duckboards
  const handleMudSteps = useCallback(() => {
    soundEngine.ensureRunning();
    soundEngine.playMudSteps();
    flashFeedback('👢 PASSOS NA LAMA');
  }, [flashFeedback]);

  // 10. Toggle stance / Crouch into dugout
  const handleToggleStance = useCallback(() => {
    soundEngine.ensureRunning();
    soundEngine.playMudSteps();

    setIsCrouched((prev) => {
      const next = !prev;
      if (next) {
        setEnvironment('dugout');
        flashFeedback('🛡️ ABRIGADO NO DUGOUT SUBTERRÂNEO');
        setBpm((b) => Math.max(74, b - 12));
      } else {
        setEnvironment('parapet-day');
        flashFeedback('👀 OBSERVANDO NO PARAPEITO');
      }
      return next;
    });
  }, [flashFeedback]);

  // 11. Alternar neblina atmosférica (normal -> densa -> desativada)
  const toggleAtmosphericFog = useCallback(() => {
    if (!atmosphericFog) {
      setAtmosphericFog(true);
      setFogDensity('normal');
      flashFeedback('🌫️ NEBLINA ATMOSFÉRICA ATIVADA');
    } else if (fogDensity === 'normal') {
      setFogDensity('dense');
      flashFeedback('🌫️ NEBLINA DENSA DA TRINCHEIRA');
    } else {
      setAtmosphericFog(false);
      flashFeedback('🌫️ NEBLINA DESATIVADA');
    }
  }, [atmosphericFog, fogDensity, flashFeedback]);

  // Keyboard controls for tactile immersion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleFireRifle();
          break;
        case 'KeyR':
          e.preventDefault();
          handleLaunchFlare();
          break;
        case 'KeyF':
          e.preventDefault();
          handleBulletWhiz();
          break;
        case 'KeyM':
          e.preventDefault();
          handleIncomingMortar();
          break;
        case 'KeyG':
          e.preventDefault();
          handleThrowGrenade();
          break;
        case 'KeyC':
          e.preventDefault();
          handleToggleStance();
          break;
        case 'KeyS':
          e.preventDefault();
          handleStukaDive();
          break;
        case 'KeyA':
          e.preventDefault();
          handleMudSteps();
          break;
        case 'KeyB':
          e.preventDefault();
          handleArtillerySalvo();
          break;
        case 'KeyN':
          e.preventDefault();
          toggleAtmosphericFog();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleFireRifle,
    handleLaunchFlare,
    handleBulletWhiz,
    handleIncomingMortar,
    handleThrowGrenade,
    handleToggleStance,
    handleStukaDive,
    handleMudSteps,
    handleArtillerySalvo,
    toggleAtmosphericFog,
  ]);

  // Toggle true browser fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        setIsFullscreen(!isFullscreen);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Get active background image
  const getActiveImage = () => {
    switch (environment) {
      case 'dugout':
        return soldierDugoutPovImg;
      case 'night-flare':
        return soldierNightFlareImg;
      case 'parapet-day':
      default:
        return soldierPovTrenchImg;
    }
  };

  // Ambient toggles
  const toggleRain = () => {
    const next = !ambientRain;
    setAmbientRain(next);
    soundEngine.setRain(next);
  };

  const toggleWind = () => {
    const next = !ambientWind;
    setAmbientWind(next);
    soundEngine.setWind(next);
  };

  const toggleArtillery = () => {
    const next = !ambientArtillery;
    setAmbientArtillery(next);
    soundEngine.setDistantWar(next);
  };

  const toggleRadio = () => {
    const next = !ambientRadio;
    setAmbientRadio(next);
    soundEngine.setRadio(next);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none bg-stone-950 font-sans ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'h-[86vh] min-h-[640px] rounded-xl border border-stone-800'
      }`}
    >
      {/* =========================================================================
          VIEWPORT SENSORIAL (FIRST PERSON SOLDIER EYE-LEVEL)
          ========================================================================= */}
      <div
        onClick={handleFireRifle}
        className={`relative w-full h-full overflow-hidden cursor-crosshair transition-transform duration-75 ${
          screenShake === 'light'
            ? 'animate-shake-light'
            : screenShake === 'heavy'
            ? 'animate-shake-heavy'
            : screenShake === 'violent'
            ? 'animate-shake-violent'
            : ''
        }`}
      >
        {/* Background 1st Person Photo */}
        <img
          src={getActiveImage()}
          alt="Soldado na Trincheira"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ${
            hasTinnitus ? 'filter blur-[3px] saturate-50' : 'filter saturate-105'
          } ${isCrouched ? 'scale-105 translate-y-3' : 'scale-100'}`}
        />

        {/* Rain & Mist Cinematic Overlay */}
        {ambientRain && (
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06),_transparent_70%)] opacity-80" />
        )}

        {/* =========================================================================
            EFEITO VISUAL: NEBLINA ATMOSFÉRICA (OVERLAY COM GRADIENTE RADIAL E OPACIDADE)
            ========================================================================= */}
        {atmosphericFog && (
          <div
            className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-1000 ${
              fogDensity === 'dense' ? 'opacity-90' : 'opacity-75'
            }`}
          >
            {/* Camada Primária: Neblina volumétrica com gradiente radial adaptado ao ambiente */}
            <div
              className="absolute inset-0 atmospheric-trench-fog"
              style={{
                background:
                  environment === 'night-flare'
                    ? 'radial-gradient(ellipse 95% 70% at 50% 45%, rgba(220, 230, 245, 0.34) 0%, rgba(155, 170, 185, 0.22) 48%, rgba(60, 70, 80, 0.10) 80%, transparent 100%)'
                    : environment === 'dugout'
                    ? 'radial-gradient(ellipse 85% 65% at 50% 60%, rgba(175, 155, 135, 0.28) 0%, rgba(110, 95, 80, 0.18) 52%, rgba(50, 42, 35, 0.10) 82%, transparent 100%)'
                    : 'radial-gradient(ellipse 95% 70% at 50% 65%, rgba(200, 215, 225, 0.38) 0%, rgba(145, 160, 172, 0.25) 46%, rgba(75, 85, 95, 0.12) 78%, transparent 100%)',
              }}
            />

            {/* Camada Secundária: Bruma rastejante de solo sobre os sacos de areia e No Man's Land */}
            <div
              className="absolute inset-0 atmospheric-fog-layer-2 mix-blend-screen"
              style={{
                background:
                  'radial-gradient(ellipse 110% 45% at 50% 80%, rgba(190, 205, 215, 0.28) 0%, rgba(130, 145, 155, 0.16) 55%, transparent 88%)',
              }}
            />
          </div>
        )}

        {/* Dynamic Flash / Explosion Lightning */}
        {flashType === 'gun' && (
          <div className="absolute inset-0 pointer-events-none bg-amber-300/40 mix-blend-screen transition-opacity duration-75" />
        )}
        {flashType === 'flare' && (
          <div className="absolute inset-0 pointer-events-none bg-slate-100/35 mix-blend-overlay transition-opacity duration-500 animate-pulse" />
        )}
        {flashType === 'artillery' && (
          <div className="absolute inset-0 pointer-events-none bg-orange-500/50 mix-blend-color-dodge transition-opacity duration-100" />
        )}

        {/* Dirt & Mud Splatter when an explosion hits nearby */}
        {dirtSplatter && (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
            <div className="w-full h-full bg-radial-vignette opacity-70 animate-fade-in" />
            <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-amber-950/60 blur-md" />
            <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-stone-900/70 blur-lg" />
            <div className="absolute bottom-1/3 left-1/2 w-24 h-24 rounded-full bg-amber-900/50 blur-sm" />
          </div>
        )}

        {/* Tinnitus Shell-Shock Ringing Distortion Overlay */}
        {hasTinnitus && (
          <div className="absolute inset-0 pointer-events-none z-20 bg-red-950/20 mix-blend-overlay animate-pulse" />
        )}

        {/* Soldier Helmet / Eye Vignette with Heartbeat Pulse */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
            bpm > 110
              ? 'shadow-[inset_0_0_120px_rgba(220,38,38,0.45)]'
              : 'shadow-[inset_0_0_90px_rgba(0,0,0,0.85)]'
          }`}
        />

        {/* Crosshair / Weapon Aim Reticle (minimalist, low opacity) */}
        {!isCrouched && environment !== 'dugout' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
            <div className="w-8 h-8 rounded-full border border-stone-300/50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
          </div>
        )}

        {/* Action Flash Feedback banner (ephemeral, pure sensory cues) */}
        {lastActionFeedback && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="px-5 py-2 rounded-full bg-stone-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 font-bold tracking-wider text-sm sm:text-base uppercase shadow-2xl animate-bounce">
              {lastActionFeedback}
            </div>
          </div>
        )}

        {/* =========================================================================
            TOP SENSORY STATUS BAR (Vitals, Stance, Atmosphere)
            ========================================================================= */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 sm:p-6 flex items-center justify-between pointer-events-none">
          {/* Soldier Vitals */}
          <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
            {/* Heartbeat Sensor */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all ${
                bpm > 110
                  ? 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                  : 'bg-stone-950/70 border-stone-700/80 text-stone-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${bpm > 100 ? 'text-red-400 fill-red-400' : 'text-stone-400'}`} />
              <span className="font-mono text-xs sm:text-sm font-bold">{bpm} BPM</span>
            </div>

            {/* Stance Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-950/70 backdrop-blur-md border border-stone-700/80 text-xs sm:text-sm text-stone-200">
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">
                {isCrouched ? 'ABRIGADO' : 'OBSERVANDO PARAPEITO'}
              </span>
            </div>

            {/* Environment Preset Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-950/80 p-1 rounded-full border border-stone-700/80">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEnvironment('parapet-day');
                  setIsCrouched(false);
                }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  environment === 'parapet-day'
                    ? 'bg-amber-600 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-100'
                }`}
              >
                Terra de Ninguém
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEnvironment('night-flare');
                  setIsCrouched(false);
                }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  environment === 'night-flare'
                    ? 'bg-amber-600 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-100'
                }`}
              >
                Noite com Sinalizador
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEnvironment('dugout');
                  setIsCrouched(true);
                }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  environment === 'dugout'
                    ? 'bg-amber-600 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-100'
                }`}
              >
                Abrigo Dugout
              </button>
            </div>
          </div>

          {/* Quick Ambient & Fullscreen Toggles */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Ambient Rain Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRain();
              }}
              title="Chuva na Trincheira"
              className={`p-2 rounded-full border backdrop-blur-md transition-colors ${
                ambientRain
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                  : 'bg-stone-950/60 border-stone-800 text-stone-500'
              }`}
            >
              <CloudRain className="w-4 h-4" />
            </button>

            {/* Ambient Wind Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWind();
              }}
              title="Vento da Frente"
              className={`p-2 rounded-full border backdrop-blur-md transition-colors ${
                ambientWind
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-stone-950/60 border-stone-800 text-stone-500'
              }`}
            >
              <Wind className="w-4 h-4" />
            </button>

            {/* Ambient Artillery Rumble */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleArtillery();
              }}
              title="Bombardeio Distante"
              className={`p-2 rounded-full border backdrop-blur-md transition-colors ${
                ambientArtillery
                  ? 'bg-red-950/80 border-red-500 text-red-300'
                  : 'bg-stone-950/60 border-stone-800 text-stone-500'
              }`}
            >
              <Flame className="w-4 h-4" />
            </button>

            {/* Field Radio Morse */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRadio();
              }}
              title="Rádio de Trincheira"
              className={`p-2 rounded-full border backdrop-blur-md transition-colors ${
                ambientRadio
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-stone-950/60 border-stone-800 text-stone-500'
              }`}
            >
              <Radio className="w-4 h-4" />
            </button>

            {/* Haptic Vibration Toggle for Mobile Devices */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const next = !hapticsEnabled;
                setHapticsEnabled(next);
                if (next && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                  try {
                    navigator.vibrate([100, 50, 100]);
                  } catch {}
                }
                flashFeedback(next ? '📳 VIBRAÇÃO ATIVADA' : '📴 VIBRAÇÃO DESATIVADA');
              }}
              title={hapticsEnabled ? 'Feedback Tátil Ativo (Vibração em Tremores Pesados)' : 'Feedback Tátil Desativado'}
              className={`p-2 rounded-full border backdrop-blur-md transition-colors ${
                hapticsEnabled
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-stone-950/60 border-stone-800 text-stone-500'
              }`}
            >
              {hapticsEnabled ? <Vibrate className="w-4 h-4" /> : <VibrateOff className="w-4 h-4" />}
            </button>

            {/* Atmospheric Fog Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleAtmosphericFog();
              }}
              title={
                atmosphericFog
                  ? `Neblina Atmosférica: ${fogDensity === 'dense' ? 'Densa' : 'Normal'} (Clique para alternar)`
                  : 'Neblina Atmosférica Desativada'
              }
              className={`p-2 rounded-full border backdrop-blur-md transition-colors ${
                atmosphericFog
                  ? fogDensity === 'dense'
                    ? 'bg-slate-800/90 border-slate-400 text-slate-100 shadow-[0_0_12px_rgba(203,213,225,0.35)]'
                    : 'bg-slate-900/80 border-slate-500 text-slate-300'
                  : 'bg-stone-950/60 border-stone-800 text-stone-500'
              }`}
            >
              <CloudFog className="w-4 h-4" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              title="Modo Imersão Total"
              className="p-2 rounded-full bg-stone-950/80 hover:bg-stone-800 border border-stone-700 text-stone-200 backdrop-blur-md transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Subtle helper hint at bottom left (fades) */}
        <div className="absolute bottom-28 left-6 hidden lg:block pointer-events-none opacity-60 text-[11px] text-stone-300 space-y-0.5">
          <div><kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-400 font-mono">Espaço / Clique</kbd> Atirar</div>
          <div><kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-400 font-mono">R</kbd> Sinalizador</div>
          <div><kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-400 font-mono">F</kbd> Projétil Rasante 3D</div>
          <div><kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-400 font-mono">M</kbd> Alerta Morteiro</div>
          <div><kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-400 font-mono">C</kbd> Agachar / Abrigo</div>
          <div><kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-700 rounded text-amber-400 font-mono">N</kbd> Neblina Atmosférica</div>
        </div>

        {/* =========================================================================
            BOTTOM SENSORY ACTION DASHBOARD (PURE TACTILE STIMULI)
            ========================================================================= */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 inset-x-0 z-30 p-3 sm:p-5 bg-gradient-to-t from-stone-950 via-stone-950/90 to-transparent"
        >
          <div className="mx-auto max-w-5xl flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {/* 1. Fire Rifle */}
            <button
              onClick={handleFireRifle}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/40 transition-transform"
            >
              <Crosshair className="w-4 h-4" />
              <span>DISPARAR FUZIL</span>
            </button>

            {/* 2. Launch Flare */}
            <button
              onClick={handleLaunchFlare}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 active:scale-95 text-amber-300 border border-amber-600/50 font-bold text-xs sm:text-sm shadow-md transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              <span>SINALIZADOR</span>
            </button>

            {/* 3. Bullet Whiz 3D */}
            <button
              onClick={handleBulletWhiz}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 active:scale-95 text-red-400 border border-red-700/50 font-bold text-xs sm:text-sm shadow-md transition-transform"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>PROJÉTIL RASANTE!</span>
            </button>

            {/* 4. Incoming Mortar */}
            <button
              onClick={handleIncomingMortar}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 active:scale-95 text-orange-400 border border-orange-700/50 font-bold text-xs sm:text-sm shadow-md transition-transform"
            >
              <Bomb className="w-4 h-4" />
              <span>ALERTA MORTEIRO</span>
            </button>

            {/* 5. Hand Grenade */}
            <button
              onClick={handleThrowGrenade}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 active:scale-95 text-stone-200 border border-stone-700 font-bold text-xs sm:text-sm shadow-md transition-transform"
            >
              <span>💣</span>
              <span>GRANADA</span>
            </button>

            {/* 6. Stuka Dive */}
            <button
              onClick={handleStukaDive}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 active:scale-95 text-yellow-400 border border-yellow-700/50 font-bold text-xs sm:text-sm shadow-md transition-transform"
            >
              <Plane className="w-4 h-4" />
              <span>STUKA</span>
            </button>

            {/* 7. Artillery Salvo */}
            <button
              onClick={handleArtillerySalvo}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 active:scale-95 text-red-300 border border-red-800/50 font-bold text-xs sm:text-sm shadow-md transition-transform"
            >
              <Flame className="w-4 h-4" />
              <span>BARRAGEM</span>
            </button>

            {/* 8. Mud footsteps */}
            <button
              onClick={handleMudSteps}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 active:scale-95 text-stone-300 border border-stone-800 text-xs sm:text-sm transition-transform"
            >
              <Footprints className="w-4 h-4" />
              <span>PASSOS</span>
            </button>

            {/* 9. Duck / Crouch into Dugout */}
            <button
              onClick={handleToggleStance}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                isCrouched
                  ? 'bg-amber-700 text-stone-950 border-amber-500'
                  : 'bg-stone-900/90 text-stone-200 border-stone-700 hover:bg-stone-800'
              }`}
            >
              {isCrouched ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{isCrouched ? 'LEVANTAR' : 'ABAIXAR / ABRIGO'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
