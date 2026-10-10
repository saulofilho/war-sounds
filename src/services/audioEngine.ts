/**
 * WWII Audio Engine: High-Fidelity Procedural Web Audio API Synthesizer (V3 Cinematic 3D Spatial Edition)
 * Enhanced with advanced physical acoustic modeling:
 * - Full 3D Positional Audio using Web Audio PannerNode (HRTF binaural spatializer) & AudioListener
 * - Dynamic moving 3D sound trajectories for aircraft flyovers, diving bombers, arcing artillery, and supersonic bullet whizzes
 * - Directional trench coning (sound radiation angles and atmospheric occlusion)
 * - Procedural stereo Convolution Reverb Impulse Response (earthen trench, concrete bunker, open crater field)
 * - Real-time AnalyserNode for audio visualization and acoustic radar
 * - Supersonic Mach cone crack + Chamber gas combustion multi-stage physics
 * - Multi-harmonic engine synthesizers for Rolls-Royce Merlin, Maybach V-12, and Wright radials
 * - Stuka dual-siren aerodynamic flutter tracking dive velocity in 3D space
 * - M1 Garand ping with steel en-bloc clip resonance and ground bounce
 * - 4-stage Kar98k mechanical bolt manipulation sequence
 * - Multi-layered continuous trench ambience with dynamic rain drips, wind howl, and distance war
 */

export type AcousticEnvironment = 'trenchMud' | 'bunkerConcrete' | 'openCraterField';
export type TrenchDirection = 'front' | 'left-flank' | 'right-flank' | 'rear' | 'overhead';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export class WWIISoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private convolverNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  public analyserNode: AnalyserNode | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  public isBinauralMode: boolean = true;
  public currentAcousticEnvironment: AcousticEnvironment = 'trenchMud';
  public reverbMix: number = 0.42;

  // Ambience nodes
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private rainDripsInterval: number | null = null;
  private windNode: AudioNode | null = null;
  private windGain: GainNode | null = null;
  private distantArtilleryInterval: number | null = null;
  private radioNode: AudioNode | null = null;
  private radioGain: GainNode | null = null;

  public ambientState = {
    rain: false,
    wind: false,
    distantWar: false,
    radio: false,
  };

  public init() {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Studio-grade Limiter / Compressor Node
    this.compressorNode = this.ctx.createDynamicsCompressor();
    this.compressorNode.threshold.setValueAtTime(-2.0, this.ctx.currentTime);
    this.compressorNode.knee.setValueAtTime(6.0, this.ctx.currentTime);
    this.compressorNode.ratio.setValueAtTime(14.0, this.ctx.currentTime);
    this.compressorNode.attack.setValueAtTime(0.001, this.ctx.currentTime);
    this.compressorNode.release.setValueAtTime(0.12, this.ctx.currentTime);

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    // Real-time Analyser for acoustic radar / audio visualizer
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // Configure 3D AudioListener representing soldier in trench (ear height 1.7m, facing No Man's Land: -Z)
    this.updateListenerOrientation(0, 0);

    // Real-world Trench Convolution Reverb
    this.convolverNode = this.ctx.createConvolver();
    this.convolverNode.buffer = this.generateTrenchImpulseResponse(this.currentAcousticEnvironment);

    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.setValueAtTime(this.reverbMix, this.ctx.currentTime);

    this.convolverNode.connect(this.reverbGain);
    this.reverbGain.connect(this.masterGain);

    this.masterGain.connect(this.analyserNode);
    this.analyserNode.connect(this.compressorNode);
    this.compressorNode.connect(this.ctx.destination);

    this.isInitialized = true;
  }

  public ensureRunning(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return !!this.ctx;
  }

  /**
   * Updates AudioListener 3D position and orientation in the trench frame of reference
   * Soldier stands at x: 0, y: 1.7m, z: 0.
   * Azimuth: 0 = looking forward into No Man's land; -90 = left flank; +90 = right flank
   */
  public updateListenerOrientation(azimuthDeg: number = 0, elevationDeg: number = 0) {
    if (!this.ctx || !this.ctx.listener) return;
    const l = this.ctx.listener;
    const now = this.ctx.currentTime;

    const radAz = (azimuthDeg * Math.PI) / 180;
    const radEl = (elevationDeg * Math.PI) / 180;

    const fwdX = Math.sin(radAz) * Math.cos(radEl);
    const fwdY = Math.sin(radEl);
    const fwdZ = -Math.cos(radAz) * Math.cos(radEl);

    if ('positionX' in l) {
      l.positionX.setValueAtTime(0, now);
      l.positionY.setValueAtTime(1.7, now);
      l.positionZ.setValueAtTime(0, now);
      l.forwardX.setValueAtTime(fwdX, now);
      l.forwardY.setValueAtTime(fwdY, now);
      l.forwardZ.setValueAtTime(fwdZ, now);
      l.upX.setValueAtTime(0, now);
      l.upY.setValueAtTime(1, now);
      l.upZ.setValueAtTime(0, now);
    } else {
      const legacyL = l as unknown as { setPosition?: Function; setOrientation?: Function };
      if (legacyL.setPosition) {
        legacyL.setPosition(0, 1.7, 0);
      }
      if (legacyL.setOrientation) {
        legacyL.setOrientation(fwdX, fwdY, fwdZ, 0, 1, 0);
      }
    }
  }

  public setMasterVolume(val: number) {
    if (!this.masterGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, val));
    this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : clamped, this.ctx.currentTime, 0.04);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime, 0.04);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleBinauralMode(): boolean {
    this.isBinauralMode = !this.isBinauralMode;
    return this.isBinauralMode;
  }

  public setReverbMix(mix: number) {
    this.reverbMix = Math.max(0, Math.min(1, mix));
    if (this.reverbGain && this.ctx) {
      this.reverbGain.gain.setTargetAtTime(this.reverbMix, this.ctx.currentTime, 0.05);
    }
  }

  public setAcousticEnvironment(env: AcousticEnvironment) {
    this.currentAcousticEnvironment = env;
    if (this.ctx && this.convolverNode) {
      this.convolverNode.buffer = this.generateTrenchImpulseResponse(env);
    }
  }

  /**
   * Generates a stereo impulse response modeling the exact physical acoustics of a WWII trench
   * Includes discrete ray-traced early reflections (floor duckboards, sandbag parapets, dugout shelters),
   * resonant cavity modes, and frequency-dependent atmospheric ground-wave damping.
   */
  private generateTrenchImpulseResponse(environment: AcousticEnvironment = 'trenchMud'): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const rate = this.ctx.sampleRate;

    let durationSec = 2.4;
    let highDamping = 6.8;
    let lowDamping = 1.35;
    let cavityFreq1 = 115;
    let cavityFreq2 = 235;

    // Early reflection taps: [delayMs, gainLeft, gainRight]
    let taps: [number, number, number][] = [];

    if (environment === 'trenchMud') {
      durationSec = 2.4;
      highDamping = 7.2;
      lowDamping = 1.35;
      cavityFreq1 = 112;
      cavityFreq2 = 228;
      taps = [
        [3.8, 0.75, 0.65],
        [8.4, -0.68, 0.72],
        [12.2, 0.60, -0.58],
        [21.5, -0.48, 0.44],
        [34.0, 0.42, 0.48],
        [52.0, -0.32, -0.30],
        [78.0, 0.24, 0.26],
      ];
    } else if (environment === 'bunkerConcrete') {
      durationSec = 1.7;
      highDamping = 4.2;
      lowDamping = 2.1;
      cavityFreq1 = 185;
      cavityFreq2 = 380;
      taps = [
        [2.2, 0.88, 0.82],
        [4.8, -0.78, 0.80],
        [9.2, 0.72, -0.70],
        [15.8, -0.62, 0.65],
        [24.0, 0.52, -0.55],
        [42.0, -0.40, 0.42],
      ];
    } else {
      durationSec = 3.2;
      highDamping = 5.5;
      lowDamping = 0.95;
      cavityFreq1 = 80;
      cavityFreq2 = 160;
      taps = [
        [18.0, 0.45, 0.50],
        [38.0, -0.42, 0.38],
        [72.0, 0.38, -0.35],
        [120.0, -0.32, 0.30],
        [190.0, 0.26, -0.28],
      ];
    }

    const length = Math.floor(rate * durationSec);
    const buffer = this.ctx.createBuffer(2, length, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // 1. Synthesize discrete ray-traced early reflections
    taps.forEach(([delayMs, gL, gR]) => {
      const sampleIdx = Math.floor((delayMs / 1000) * rate);
      if (sampleIdx < length) {
        for (let k = 0; k < 18; k++) {
          const idx = sampleIdx + k;
          if (idx < length) {
            const decay = Math.exp(-k * 0.28);
            left[idx] += gL * decay * (Math.random() * 0.4 + 0.8);
            right[idx] += gR * decay * (Math.random() * 0.4 + 0.8);
          }
        }
      }
    });

    // 2. Synthesize continuous frequency-dependent diffuse tail + trench cavity modes
    let lowFilterL = 0.0;
    let lowFilterR = 0.0;

    for (let i = 0; i < length; i++) {
      const t = i / rate;
      const envHigh = Math.exp(-t * highDamping);
      const envLow = Math.exp(-t * lowDamping);
      const cavityL = Math.sin(2 * Math.PI * cavityFreq1 * t) * 0.18 * envLow;
      const cavityR = Math.sin(2 * Math.PI * cavityFreq2 * t) * 0.18 * envLow;

      const noiseL = Math.random() * 2 - 1;
      const noiseR = Math.random() * 2 - 1;

      lowFilterL = lowFilterL * 0.88 + noiseL * 0.12;
      lowFilterR = lowFilterR * 0.88 + noiseR * 0.12;

      const sampleL = (noiseL * envHigh * 0.45 + lowFilterL * envLow * 1.6 + cavityL) * 0.38;
      const sampleR = (noiseR * envHigh * 0.45 + lowFilterR * envLow * 1.6 + cavityR) * 0.38;

      left[i] += sampleL;
      right[i] += sampleR;
    }

    return buffer;
  }

  /**
   * Generates a Brown noise buffer for authentic kinetic explosions, cannon blast, and wind
   */
  private createBrownNoiseBuffer(durationSec: number = 1.0): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const length = Math.floor(this.ctx.sampleRate * durationSec);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.025 * white) / 1.025;
      lastOut = data[i];
      data[i] *= 3.8;
    }
    return buffer;
  }

  /**
   * Generates a Pink noise buffer for wind, respiration, and mechanical friction
   */
  private createPinkNoiseBuffer(durationSec: number = 1.0): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const length = Math.floor(this.ctx.sampleRate * durationSec);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  /**
   * Alias for Ju 87 dive bomber
   */
  public playStuka(distance: 'near' | 'mid' | 'far' = 'near', pan: number | TrenchDirection = 0) {
    this.playStukaDive(distance, pan);
  }

  /**
   * Alias for 105mm artillery blast
   */
  public playHowitzer105(distance: 'near' | 'mid' | 'far' = 'near', pan: number | TrenchDirection = 0) {
    this.playArtilleryBlast(distance, pan);
  }

  /**
   * Helper to set PannerNode position across modern AudioParam and legacy Web Audio
   */
  public setPannerPos(panner: PannerNode, x: number, y: number, z: number, time?: number) {
    if (!this.ctx) return;
    const t = time ?? this.ctx.currentTime;
    if ('positionX' in panner) {
      panner.positionX.setValueAtTime(x, t);
      panner.positionY.setValueAtTime(y, t);
      panner.positionZ.setValueAtTime(z, t);
    } else {
      const leg = panner as unknown as { setPosition?: Function };
      if (leg.setPosition) leg.setPosition(x, y, z);
    }
  }

  /**
   * Helper to linearly animate PannerNode position over time (e.g. aircraft flyover)
   */
  public rampPannerPos(panner: PannerNode, toX: number, toY: number, toZ: number, endTime: number) {
    if (!this.ctx) return;
    if ('positionX' in panner) {
      panner.positionX.linearRampToValueAtTime(toX, endTime);
      panner.positionY.linearRampToValueAtTime(toY, endTime);
      panner.positionZ.linearRampToValueAtTime(toZ, endTime);
    } else {
      const leg = panner as unknown as { setPosition?: Function };
      if (leg.setPosition) leg.setPosition(toX, toY, toZ);
    }
  }

  /**
   * Computes 3D Cartesian coordinates based on distance, pan (-1 to 1) or specific trench directions
   */
  public calculateTrenchCoordinates(
    distance: 'near' | 'mid' | 'far' | number = 'near',
    panOrDirection: number | TrenchDirection = 0,
    elevationAngleDeg: number = 0
  ): Position3D {
    let radius = 14;
    if (typeof distance === 'number') {
      radius = distance;
    } else if (distance === 'mid') {
      radius = 70;
    } else if (distance === 'far') {
      radius = 280;
    }

    if (typeof panOrDirection === 'string') {
      switch (panOrDirection) {
        case 'front':
          return { x: 0, y: 1.2, z: -radius };
        case 'left-flank':
          return { x: -radius * 0.92, y: 1.2, z: -radius * 0.38 };
        case 'right-flank':
          return { x: radius * 0.92, y: 1.2, z: -radius * 0.38 };
        case 'rear':
          return { x: 0, y: 1.5, z: radius * 0.75 };
        case 'overhead':
          return { x: 0, y: Math.max(45, radius * 0.6), z: -radius * 0.2 };
      }
    }

    const angleRad = (panOrDirection * Math.PI) / 2; // -90° (Left Flank) to +90° (Right Flank)
    const elRad = (elevationAngleDeg * Math.PI) / 180;

    const posX = Math.sin(angleRad) * Math.cos(elRad) * radius;
    const posY = 1.2 + Math.sin(elRad) * radius;
    const posZ = -Math.cos(angleRad) * Math.cos(elRad) * radius;

    return { x: posX, y: posY, z: posZ };
  }

  /**
   * Creates an acoustic channel voice with true 3D PannerNode spatialization, distance low-pass, and trench reverb send
   */
  public createVoice(
    distance: 'near' | 'mid' | 'far' = 'near',
    pan: number | TrenchDirection = 0,
    reverbSendAmount: number = 0.28,
    customCoords?: Position3D
  ) {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return null;

    const ctx = this.ctx;
    const voiceGain = ctx.createGain();
    const distanceFilter = ctx.createBiquadFilter();

    // Distance attenuation and atmospheric high-frequency roll-off
    if (distance === 'near') {
      distanceFilter.type = 'lowpass';
      distanceFilter.frequency.setValueAtTime(20000, ctx.currentTime);
      voiceGain.gain.setValueAtTime(1.0, ctx.currentTime);
    } else if (distance === 'mid') {
      distanceFilter.type = 'lowpass';
      distanceFilter.frequency.setValueAtTime(3800, ctx.currentTime);
      voiceGain.gain.setValueAtTime(0.75, ctx.currentTime);
    } else {
      distanceFilter.type = 'lowpass';
      distanceFilter.frequency.setValueAtTime(980, ctx.currentTime);
      voiceGain.gain.setValueAtTime(0.48, ctx.currentTime);
    }

    // 3D Cartesian coordinates
    const coords = customCoords || this.calculateTrenchCoordinates(distance, pan);

    // 3D PannerNode using HRTF binaural algorithm
    const panner = ctx.createPanner();
    panner.panningModel = this.isBinauralMode ? 'HRTF' : 'equalpower';
    panner.distanceModel = 'inverse';
    panner.refDistance = 3.0; // Distance where listener experiences full volume
    panner.maxDistance = 2800; // Far battlefield boundary
    panner.rolloffFactor = 1.15; // Physically realistic natural sound attenuation
    panner.coneInnerAngle = 120;
    panner.coneOuterAngle = 240;
    panner.coneOuterGain = 0.45;

    // Face sound towards the trench listener
    const len = Math.hypot(coords.x, coords.y - 1.7, coords.z) || 1;
    const dirX = -coords.x / len;
    const dirY = -(coords.y - 1.7) / len;
    const dirZ = -coords.z / len;

    if ('orientationX' in panner) {
      panner.orientationX.setValueAtTime(dirX, ctx.currentTime);
      panner.orientationY.setValueAtTime(dirY, ctx.currentTime);
      panner.orientationZ.setValueAtTime(dirZ, ctx.currentTime);
    }

    this.setPannerPos(panner, coords.x, coords.y, coords.z, ctx.currentTime);

    // Chain: Input -> DistanceFilter -> PannerNode -> MasterGain
    voiceGain.connect(distanceFilter);
    distanceFilter.connect(panner);
    panner.connect(this.masterGain);

    // Send to trench convolution reverb for realistic early reflections and soil damping
    if (this.convolverNode && reverbSendAmount > 0) {
      const sendGain = ctx.createGain();
      sendGain.gain.setValueAtTime(reverbSendAmount, ctx.currentTime);
      distanceFilter.connect(sendGain);
      sendGain.connect(this.convolverNode);
    }

    return {
      ctx,
      input: voiceGain,
      panner,
      master: this.masterGain,
      coords,
    };
  }

  // -------------------------------------------------------------
  // ARMAS DE INFANTARIA (WEAPONS)
  // -------------------------------------------------------------

  /**
   * M1 Garand: Multi-stage supersonic rifle crack + chamber detonation + en-bloc ping & ground bounce in 3D
   */
  public playM1Garand(
    shots: number = 8,
    withPing: boolean = true,
    distance: 'near' | 'mid' | 'far' = 'near',
    pan: number | TrenchDirection = 0
  ) {
    const voice = this.createVoice(distance, pan, 0.35);
    if (!voice) return;
    const { ctx, input } = voice;

    const playSingleShot = (time: number) => {
      // 1. Supersonic bullet Mach cone snap (<15ms)
      const snapBuf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const snapData = snapBuf.getChannelData(0);
      for (let i = 0; i < snapData.length; i++) {
        snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
      }
      const snap = ctx.createBufferSource();
      snap.buffer = snapBuf;
      const snapFilter = ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(3200, time);
      snapFilter.Q.setValueAtTime(2.2, time);
      const snapGain = ctx.createGain();
      snapGain.gain.setValueAtTime(1.2, time);
      snapGain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

      snap.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(input);
      snap.start(time);
      snap.stop(time + 0.05);

      // 2. High-energy chamber combustion blast (Brownian gas expansion)
      const blastBuf = this.createBrownNoiseBuffer(0.38);
      const blastSource = ctx.createBufferSource();
      blastSource.buffer = blastBuf;
      const blastFilter = ctx.createBiquadFilter();
      blastFilter.type = 'lowpass';
      blastFilter.frequency.setValueAtTime(550, time);
      blastFilter.frequency.exponentialRampToValueAtTime(85, time + 0.35);
      const blastGain = ctx.createGain();
      blastGain.gain.setValueAtTime(1.5, time);
      blastGain.gain.exponentialRampToValueAtTime(0.001, time + 0.36);

      blastSource.connect(blastFilter);
      blastFilter.connect(blastGain);
      blastGain.connect(input);
      blastSource.start(time);
      blastSource.stop(time + 0.38);

      // 3. Kinetic recoil thump (sub-bass punch)
      const thump = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thump.type = 'triangle';
      thump.frequency.setValueAtTime(190, time);
      thump.frequency.exponentialRampToValueAtTime(42, time + 0.12);
      thumpGain.gain.setValueAtTime(1.1, time);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      thump.connect(thumpGain);
      thumpGain.connect(input);
      thump.start(time);
      thump.stop(time + 0.16);

      // 4. Operating rod reciprocating mechanical metallic clack
      const rod = ctx.createOscillator();
      const rodGain = ctx.createGain();
      rod.type = 'sine';
      rod.frequency.setValueAtTime(1250, time + 0.04);
      rod.frequency.setValueAtTime(820, time + 0.08);
      rodGain.gain.setValueAtTime(0.2, time + 0.04);
      rodGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      rod.connect(rodGain);
      rodGain.connect(input);
      rod.start(time + 0.04);
      rod.stop(time + 0.11);
    };

    const now = ctx.currentTime;
    const interval = 0.23;
    for (let i = 0; i < shots; i++) {
      playSingleShot(now + i * interval);
    }

    // 5. Iconic M1 Clip Eject "PING" & Duckboard Bounce
    if (withPing) {
      const pingTime = now + shots * interval + 0.06;
      this.playAuthenticGarandPing(pingTime, input);
    }
  }

  private playAuthenticGarandPing(time: number, dest: AudioNode) {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Resonant spring-steel modes: 2440 Hz, 3180 Hz, 4260 Hz, 5100 Hz
    const freqs = [2440, 3180, 4260, 5100];
    const decays = [0.95, 0.75, 0.5, 0.35];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.42 / (idx + 1), time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decays[idx]);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + decays[idx] + 0.05);
    });

    // Follower spring bounce rattle at +120ms
    const rattleTime = time + 0.12;
    const rattle = ctx.createOscillator();
    const rattleGain = ctx.createGain();
    rattle.type = 'triangle';
    rattle.frequency.setValueAtTime(1750, rattleTime);
    rattleGain.gain.setValueAtTime(0.12, rattleTime);
    rattleGain.gain.exponentialRampToValueAtTime(0.001, rattleTime + 0.09);
    rattle.connect(rattleGain);
    rattleGain.connect(dest);
    rattle.start(rattleTime);
    rattle.stop(rattleTime + 0.1);

    // Clip hitting wooden duckboards / gravel in trench at +380ms
    const bounceTime = time + 0.38;
    const bounce = ctx.createOscillator();
    const bounceGain = ctx.createGain();
    bounce.type = 'sine';
    bounce.frequency.setValueAtTime(1950, bounceTime);
    bounce.frequency.setValueAtTime(1420, bounceTime + 0.03);
    bounceGain.gain.setValueAtTime(0.18, bounceTime);
    bounceGain.gain.exponentialRampToValueAtTime(0.001, bounceTime + 0.08);
    bounce.connect(bounceGain);
    bounceGain.connect(dest);
    bounce.start(bounceTime);
    bounce.stop(bounceTime + 0.09);
  }

  /**
   * MG 42 "Hitler's Buzzsaw": 1200+ rpm canvas-ripping burst with barrel booster gas chuff
   */
  public playMG42(
    burstDurationSec: number = 1.2,
    distance: 'near' | 'mid' | 'far' = 'near',
    pan: number | TrenchDirection = 0
  ) {
    const voice = this.createVoice(distance, pan, 0.4);
    if (!voice) return;
    const { ctx, input } = voice;

    const roundCount = Math.floor(burstDurationSec * 22);
    const avgInterval = burstDurationSec / roundCount;
    const now = ctx.currentTime;

    for (let i = 0; i < roundCount; i++) {
      const jitter = (Math.random() - 0.5) * 0.0035;
      const shotTime = now + i * avgInterval + jitter;

      // 1. High-pressure gas rip
      const crackBuf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const crackData = crackBuf.getChannelData(0);
      for (let j = 0; j < crackData.length; j++) {
        crackData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.005));
      }
      const crack = ctx.createBufferSource();
      crack.buffer = crackBuf;
      const crackFilt = ctx.createBiquadFilter();
      crackFilt.type = 'highpass';
      crackFilt.frequency.setValueAtTime(1550, shotTime);
      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.95, shotTime);
      crackGain.gain.exponentialRampToValueAtTime(0.01, shotTime + 0.035);

      crack.connect(crackFilt);
      crackFilt.connect(crackGain);
      crackGain.connect(input);
      crack.start(shotTime);
      crack.stop(shotTime + 0.04);

      // 2. Heavy cyclic punch
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = 'sawtooth';
      thud.frequency.setValueAtTime(160, shotTime);
      thud.frequency.exponentialRampToValueAtTime(40, shotTime + 0.035);
      thudGain.gain.setValueAtTime(0.75, shotTime);
      thudGain.gain.exponentialRampToValueAtTime(0.01, shotTime + 0.038);

      thud.connect(thudGain);
      thudGain.connect(input);
      thud.start(shotTime);
      thud.stop(shotTime + 0.04);
    }
  }

  /**
   * Karabiner 98k: Heavy 7.92mm Mauser rifle crack + 4-stage realistic bolt manipulation
   */
  public playKar98k(distance: 'near' | 'mid' | 'far' = 'near', pan: number | TrenchDirection = 0) {
    const voice = this.createVoice(distance, pan, 0.45);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    // 1. Supersonic crack
    const bufSize = ctx.sampleRate * 0.6;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.06));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2100, now);
    filter.Q.setValueAtTime(1.6, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(input);
    noise.start(now);
    noise.stop(now + 0.6);

    // 2. Low-frequency ground shock
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(190, now);
    thud.frequency.exponentialRampToValueAtTime(30, now + 0.22);
    thudGain.gain.setValueAtTime(1.2, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    thud.connect(thudGain);
    thudGain.connect(input);
    thud.start(now);
    thud.stop(now + 0.28);

    // 3. Realistic 4-Stage Bolt Cycle:
    const liftT = now + 0.62;
    const liftOsc = ctx.createOscillator();
    const liftG = ctx.createGain();
    liftOsc.type = 'sine';
    liftOsc.frequency.setValueAtTime(1200, liftT);
    liftG.gain.setValueAtTime(0.22, liftT);
    liftG.gain.exponentialRampToValueAtTime(0.001, liftT + 0.08);
    liftOsc.connect(liftG);
    liftG.connect(input);
    liftOsc.start(liftT);
    liftOsc.stop(liftT + 0.09);

    const pullT = now + 0.8;
    const pullOsc = ctx.createOscillator();
    const pullG = ctx.createGain();
    pullOsc.type = 'triangle';
    pullOsc.frequency.setValueAtTime(780, pullT);
    pullOsc.frequency.linearRampToValueAtTime(1550, pullT + 0.1);
    pullG.gain.setValueAtTime(0.28, pullT);
    pullG.gain.exponentialRampToValueAtTime(0.001, pullT + 0.12);
    pullOsc.connect(pullG);
    pullG.connect(input);
    pullOsc.start(pullT);
    pullOsc.stop(pullT + 0.13);

    const brassT = now + 0.98;
    const brassOsc = ctx.createOscillator();
    const brassG = ctx.createGain();
    brassOsc.type = 'sine';
    brassOsc.frequency.setValueAtTime(2600, brassT);
    brassOsc.frequency.setValueAtTime(2100, brassT + 0.03);
    brassG.gain.setValueAtTime(0.15, brassT);
    brassG.gain.exponentialRampToValueAtTime(0.001, brassT + 0.07);
    brassOsc.connect(brassG);
    brassG.connect(input);
    brassOsc.start(brassT);
    brassOsc.stop(brassT + 0.08);

    const lockT = now + 1.15;
    const lockOsc = ctx.createOscillator();
    const lockG = ctx.createGain();
    lockOsc.type = 'sine';
    lockOsc.frequency.setValueAtTime(1650, lockT);
    lockOsc.frequency.setValueAtTime(880, lockT + 0.06);
    lockG.gain.setValueAtTime(0.35, lockT);
    lockG.gain.exponentialRampToValueAtTime(0.001, lockT + 0.1);
    lockOsc.connect(lockG);
    lockG.connect(input);
    lockOsc.start(lockT);
    lockOsc.stop(lockT + 0.12);
  }

  /**
   * Thompson M1A1: Heavy .45 ACP submachine gun burst with open-bolt cyclic rattle
   */
  public playThompson(
    burstCount: number = 8,
    distance: 'near' | 'mid' | 'far' = 'near',
    pan: number | TrenchDirection = 0
  ) {
    const voice = this.createVoice(distance, pan, 0.3);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;
    const interval = 0.088;

    for (let i = 0; i < burstCount; i++) {
      const time = now + i * interval;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.07);
      oscGain.gain.setValueAtTime(1.0, time);
      oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.075);

      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.018));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.75, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.075);

      osc.connect(oscGain);
      oscGain.connect(input);
      noise.connect(noiseGain);
      noiseGain.connect(input);

      osc.start(time);
      noise.start(time);
      osc.stop(time + 0.085);
      noise.stop(time + 0.085);
    }
  }

  /**
   * Supersonic Bullet Whiz / Sniper Near-Miss in 3D:
   * A high-velocity 7.92mm bullet streaks past the soldier's head in 3D space with sonic crack and wood impact
   */
  public playBulletWhiz(side: 'left' | 'right' | 'center' = 'left') {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const startX = side === 'left' ? -2.2 : side === 'right' ? 2.2 : 0.4;
    const endX = side === 'left' ? -0.4 : side === 'right' ? 0.4 : -0.2;

    const voice = this.createVoice('near', 0, 0.4, { x: startX, y: 1.85, z: -25 });
    if (!voice) return;
    const { input, panner } = voice;

    // Animate bullet trajectory from in front (-25m) past the ear (+0m) into rear parados (+14m)
    const flightDuration = 0.065;
    this.rampPannerPos(panner, endX, 1.7, 14, now + flightDuration);

    // 1. Supersonic N-wave sonic boom snap (Mach cone compression)
    const snapBuf = ctx.createBuffer(1, ctx.sampleRate * 0.015, ctx.sampleRate);
    const snapData = snapBuf.getChannelData(0);
    for (let i = 0; i < snapData.length; i++) {
      const t = i / ctx.sampleRate;
      snapData[i] = (1 - 2 * t / 0.015) * Math.exp(-t / 0.003);
    }
    const snap = ctx.createBufferSource();
    snap.buffer = snapBuf;
    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(1.8, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    snap.connect(snapGain);
    snapGain.connect(input);
    snap.start(now);
    snap.stop(now + 0.025);

    // 2. High-frequency Doppler "Zip-Whistle"
    const whiz = ctx.createOscillator();
    const whizGain = ctx.createGain();
    whiz.type = 'sawtooth';
    whiz.frequency.setValueAtTime(4600, now);
    whiz.frequency.exponentialRampToValueAtTime(1250, now + flightDuration);
    whizGain.gain.setValueAtTime(0.85, now);
    whizGain.gain.exponentialRampToValueAtTime(0.001, now + flightDuration + 0.02);
    whiz.connect(whizGain);
    whizGain.connect(input);
    whiz.start(now);
    whiz.stop(now + flightDuration + 0.03);

    // 3. Bullet impacting trench timber / sandbag behind soldier
    const impactTime = now + flightDuration;
    const impactBuf = this.createBrownNoiseBuffer(0.18);
    const impact = ctx.createBufferSource();
    impact.buffer = impactBuf;
    const impactFilter = ctx.createBiquadFilter();
    impactFilter.type = 'lowpass';
    impactFilter.frequency.setValueAtTime(1400, impactTime);
    const impactGain = ctx.createGain();
    impactGain.gain.setValueAtTime(1.1, impactTime);
    impactGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.16);

    impact.connect(impactFilter);
    impactFilter.connect(impactGain);
    impactGain.connect(input);
    impact.start(impactTime);
    impact.stop(impactTime + 0.18);
  }

  /**
   * Trench Mortar: Hollow tube thump + ascending/descending 3D flight whistle + crater blast
   */
  public playMortar(distance: 'near' | 'mid' | 'far' = 'near', pan: number | TrenchDirection = 0) {
    const coords = this.calculateTrenchCoordinates(distance, pan);
    const voice = this.createVoice(distance, pan, 0.45, coords);
    if (!voice) return;
    const { ctx, input, panner } = voice;
    const now = ctx.currentTime;

    // Tube "plump" launch
    const tubeOsc = ctx.createOscillator();
    const tubeGain = ctx.createGain();
    tubeOsc.type = 'sine';
    tubeOsc.frequency.setValueAtTime(98, now);
    tubeOsc.frequency.exponentialRampToValueAtTime(24, now + 0.18);
    tubeGain.gain.setValueAtTime(1.3, now);
    tubeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    tubeOsc.connect(tubeGain);
    tubeGain.connect(input);
    tubeOsc.start(now);
    tubeOsc.stop(now + 0.25);

    // High arc flight in 3D: ascends into sky then drops into trench front
    const whistle = ctx.createOscillator();
    const whistleGain = ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(1050, now + 0.2);
    whistle.frequency.exponentialRampToValueAtTime(2950, now + 0.9);
    whistle.frequency.exponentialRampToValueAtTime(620, now + 1.6);

    whistleGain.gain.setValueAtTime(0.001, now + 0.2);
    whistleGain.gain.linearRampToValueAtTime(0.32, now + 0.9);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    whistle.connect(whistleGain);
    whistleGain.connect(input);
    whistle.start(now + 0.2);
    whistle.stop(now + 1.65);

    // Elevate panner up in 3D during mid-flight
    this.rampPannerPos(panner, coords.x, coords.y + 65, coords.z * 0.6, now + 0.9);
    this.rampPannerPos(panner, coords.x * 0.7, 1.2, -18, now + 1.6);

    setTimeout(() => {
      this.playArtilleryBlast('near', pan);
    }, 1580);
  }

  // -------------------------------------------------------------
  // AVIÕES (AIRCRAFT IN FULL 3D)
  // -------------------------------------------------------------

  /**
   * Junkers Ju 87 "Stuka": Steep 3D dive trajectory from high altitude (380m) screaming downward,
   * pulling up over the parapet, followed by 500kg bomb detonation
   */
  public playStukaDive(distance: 'near' | 'mid' | 'far' = 'near', pan: number | TrenchDirection = 0) {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = 4.8;

    // Start dive high up in the cloudy sky
    const startCoords: Position3D = { x: -45, y: 380, z: -280 };
    const voice = this.createVoice(distance, pan, 0.55, startCoords);
    if (!voice) return;
    const { input, panner } = voice;

    // Animate 3D dive trajectory: screaming dive drops steep towards parapet, then climbs out
    const divePeakTime = now + 2.85;
    this.rampPannerPos(panner, 10, 24, -38, divePeakTime); // Point of closest approach / bomb release
    this.rampPannerPos(panner, 85, 140, 110, now + duration); // Climbing out into the rear sky

    // Dual detuned screaming sirens (wing struts)
    const siren1 = ctx.createOscillator();
    const siren2 = ctx.createOscillator();
    const sirenGain = ctx.createGain();

    siren1.type = 'sawtooth';
    siren2.type = 'square';

    siren1.frequency.setValueAtTime(410, now);
    siren1.frequency.exponentialRampToValueAtTime(1680, divePeakTime);
    siren1.frequency.exponentialRampToValueAtTime(260, now + duration);

    siren2.frequency.setValueAtTime(425, now);
    siren2.frequency.exponentialRampToValueAtTime(1710, divePeakTime);
    siren2.frequency.exponentialRampToValueAtTime(270, now + duration);

    sirenGain.gain.setValueAtTime(0.01, now);
    sirenGain.gain.exponentialRampToValueAtTime(0.68, now + 2.65);
    sirenGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, now);
    filter.frequency.linearRampToValueAtTime(1850, divePeakTime);
    filter.Q.setValueAtTime(3.4, now);

    siren1.connect(filter);
    siren2.connect(filter);
    filter.connect(sirenGain);
    sirenGain.connect(input);

    // Rushing air wind turbulence
    const windBuf = this.createBrownNoiseBuffer(duration);
    const windSource = ctx.createBufferSource();
    windSource.buffer = windBuf;
    const windFilt = ctx.createBiquadFilter();
    windFilt.type = 'bandpass';
    windFilt.frequency.setValueAtTime(650, now);
    windFilt.frequency.linearRampToValueAtTime(2400, divePeakTime);
    const windG = ctx.createGain();
    windG.gain.setValueAtTime(0.05, now);
    windG.gain.linearRampToValueAtTime(0.55, now + 2.65);
    windG.gain.exponentialRampToValueAtTime(0.01, now + duration);

    windSource.connect(windFilt);
    windFilt.connect(windG);
    windG.connect(input);

    // Jumo 211 inverted V-12 roar
    const engineOsc = ctx.createOscillator();
    const engineGain = ctx.createGain();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.setValueAtTime(92, now);
    engineOsc.frequency.linearRampToValueAtTime(230, divePeakTime);
    engineOsc.frequency.linearRampToValueAtTime(105, now + duration);

    engineGain.gain.setValueAtTime(0.05, now);
    engineGain.gain.linearRampToValueAtTime(0.52, now + 2.7);
    engineGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    engineOsc.connect(engineGain);
    engineGain.connect(input);

    siren1.start(now);
    siren2.start(now);
    engineOsc.start(now);
    windSource.start(now);

    siren1.stop(now + duration);
    siren2.stop(now + duration);
    engineOsc.stop(now + duration);
    windSource.stop(now + duration);

    // Bomb detonation on impact zone
    setTimeout(() => {
      this.playArtilleryBlast('near', pan);
    }, 2850);
  }

  /**
   * Supermarine Spitfire: 3D flyover across the trench with Rolls-Royce Merlin V-12 engine
   * and 8 Browning .303 machine gun strafing pass in full HRTF spatial audio
   */
  public playSpitfire(panFrom: number = -1, panTo: number = 1) {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = 3.8;

    // Initial 3D position: approaching fast from the left front sky
    const startX = panFrom * 180;
    const endX = panTo * 180;
    const startCoords: Position3D = { x: startX, y: 75, z: -140 };

    const voice = this.createVoice('near', 0, 0.45, startCoords);
    if (!voice) return;
    const { input, panner } = voice;

    // Fly straight overhead across the trench in 3D
    const peakTime = now + 1.45;
    this.rampPannerPos(panner, (startX + endX) * 0.1, 24, -10, peakTime);
    this.rampPannerPos(panner, endX, 85, 160, now + duration);

    const fundamental = 165;
    const harmonics = [fundamental, fundamental * 1.5, fundamental * 2, fundamental * 3];

    harmonics.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';

      osc.frequency.setValueAtTime(freq * 1.15, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, peakTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.75, now + duration);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.42 / (idx + 1), peakTime);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(input);
      osc.start(now);
      osc.stop(now + duration);
    });

    // 8-Gun Browning Strafing burst right when passing overhead
    setTimeout(() => {
      this.playBrowningBurst3D(input);
    }, 1350);
  }

  private playBrowningBurst3D(dest: AudioNode) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    for (let i = 0; i < 22; i++) {
      const time = now + i * 0.045;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.007));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.55, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);

      noise.connect(gain);
      gain.connect(dest);
      noise.start(time);
      noise.stop(time + 0.045);
    }
  }

  /**
   * B-17 Flying Fortress Formation: Multi-engine phase beating flying overhead at 350m altitude
   * with cascading bombs dropping in 3D
   */
  public playB17Formation() {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = 6.2;

    const startCoords: Position3D = { x: 260, y: 350, z: -280 };
    const voice = this.createVoice('far', 0, 0.5, startCoords);
    if (!voice) return;
    const { input, panner } = voice;

    // Sweeps overhead in 3D space
    this.rampPannerPos(panner, 0, 320, 0, now + 2.8);
    this.rampPannerPos(panner, -260, 350, 280, now + duration);

    const freqs = [76.5, 78.2, 80.0, 81.8];
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 2.8);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(270, now);
      osc.connect(f);
      f.connect(gain);
      osc.start(now);
      osc.stop(now + duration);
    });

    gain.connect(input);

    setTimeout(() => {
      this.playBombDropWhistle3D(-0.3);
    }, 1800);
    setTimeout(() => {
      this.playBombDropWhistle3D(0.4);
    }, 2400);
    setTimeout(() => {
      this.playArtilleryBlast('far', -0.3);
    }, 3400);
    setTimeout(() => {
      this.playArtilleryBlast('mid', 0.4);
    }, 4200);
  }

  private playBombDropWhistle3D(pan: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const voice = this.createVoice('mid', pan, 0.4);
    if (!voice) return;
    const { input, panner } = voice;

    // Drop from sky (180m) down to earth (1.5m)
    const initialCoords = this.calculateTrenchCoordinates('mid', pan, 60);
    this.setPannerPos(panner, initialCoords.x, initialCoords.y, initialCoords.z, now);
    this.rampPannerPos(panner, initialCoords.x * 0.8, 1.2, initialCoords.z * 0.8, now + 1.5);

    const whistle = ctx.createOscillator();
    const gain = ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(3400, now);
    whistle.frequency.exponentialRampToValueAtTime(650, now + 1.5);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.38, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    whistle.connect(gain);
    gain.connect(input);
    whistle.start(now);
    whistle.stop(now + 1.55);
  }

  // -------------------------------------------------------------
  // TANQUES E BLINDADOS (TANKS)
  // -------------------------------------------------------------

  /**
   * Tiger I: 23L Maybach V12 diesel rumble + metal track squeals + 88mm KwK 36 cannon fire in 3D
   */
  public playTigerI(
    fireCannon: boolean = true,
    distance: 'near' | 'mid' | 'far' = 'near',
    pan: number | TrenchDirection = 0
  ) {
    const voice = this.createVoice(distance, pan, 0.45);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;
    const duration = fireCannon ? 3.8 : 2.5;

    const engineOsc = ctx.createOscillator();
    const engineGain = ctx.createGain();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.setValueAtTime(42, now);
    engineOsc.frequency.linearRampToValueAtTime(68, now + 1.2);
    engineOsc.frequency.linearRampToValueAtTime(46, now + duration);

    engineGain.gain.setValueAtTime(0.15, now);
    engineGain.gain.linearRampToValueAtTime(0.68, now + 0.8);
    engineGain.gain.exponentialRampToValueAtTime(0.02, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);

    engineOsc.connect(filter);
    filter.connect(engineGain);
    engineGain.connect(input);
    engineOsc.start(now);
    engineOsc.stop(now + duration);

    // Track squeaks
    for (let i = 0; i < 5; i++) {
      const squeakTime = now + 0.2 + i * 0.42;
      const squeak = ctx.createOscillator();
      const squeakGain = ctx.createGain();
      squeak.type = 'sine';
      squeak.frequency.setValueAtTime(1900 + Math.random() * 350, squeakTime);
      squeak.frequency.exponentialRampToValueAtTime(750, squeakTime + 0.16);
      squeakGain.gain.setValueAtTime(0.16, squeakTime);
      squeakGain.gain.exponentialRampToValueAtTime(0.001, squeakTime + 0.17);

      squeak.connect(squeakGain);
      squeakGain.connect(input);
      squeak.start(squeakTime);
      squeak.stop(squeakTime + 0.18);
    }

    if (fireCannon) {
      setTimeout(() => {
        this.play88mmCannon(distance, pan);
      }, 950);
    }
  }

  /**
   * 88mm KwK 36 Cannon: Hypersonic muzzle blast + deep subsonic pressure wave in 3D
   */
  public play88mmCannon(distance: 'near' | 'mid' | 'far' = 'near', pan: number | TrenchDirection = 0) {
    const voice = this.createVoice(distance, pan, 0.65);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(95, now);
    sub.frequency.exponentialRampToValueAtTime(18, now + 0.7);
    subGain.gain.setValueAtTime(1.65, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    const bufSize = ctx.sampleRate * 0.9;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.09));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    sub.connect(subGain);
    subGain.connect(input);
    noise.connect(noiseGain);
    noiseGain.connect(input);

    sub.start(now);
    noise.start(now);
    sub.stop(now + 0.85);
    noise.stop(now + 0.95);
  }

  /**
   * T-34/76: Rugged Soviet Kharkiv V-2 diesel engine clatter + 76.2mm cannon in 3D
   */
  public playT34(distance: 'near' | 'mid' | 'far' = 'near', pan: number | TrenchDirection = 0) {
    const voice = this.createVoice(distance, pan, 0.45);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(52, now);
    oscGain.gain.setValueAtTime(0.34, now);
    oscGain.gain.linearRampToValueAtTime(0.01, now + 2.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(360, now);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(input);
    osc.start(now);
    osc.stop(now + 2.2);

    setTimeout(() => {
      this.play88mmCannon(distance, pan);
    }, 650);
  }

  /**
   * M4 Sherman: Continental Radial engine vibration and 75mm gun in 3D
   */
  public playSherman(distance: 'near' | 'mid' | 'far' = 'near', pan: number | TrenchDirection = 0) {
    const voice = this.createVoice(distance, pan, 0.45);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(62, now);
    oscGain.gain.setValueAtTime(0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 2.2);

    osc.connect(oscGain);
    oscGain.connect(input);
    osc.start(now);
    osc.stop(now + 2.2);

    setTimeout(() => {
      this.play88mmCannon(distance, pan);
    }, 550);
  }

  // -------------------------------------------------------------
  // EXPLOSÕES & ARTILHARIA (ARTILLERY & EXPLOSIONS IN 3D)
  // -------------------------------------------------------------

  /**
   * Katyusha BM-13 "Stalin's Organ": Banshee rocket launches in salvo with overlapping whistles
   * arcing high across the 3D sky
   */
  public playKatyushaSalvo(salvoCount: number = 10, pan: number | TrenchDirection = -0.5) {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    for (let i = 0; i < salvoCount; i++) {
      const time = now + i * 0.17;
      const rocketX = (Math.random() - 0.5) * 80;
      const rocketVoice = this.createVoice('far', pan, 0.45, {
        x: rocketX,
        y: 12,
        z: -320,
      });
      if (!rocketVoice) continue;
      const { input, panner } = rocketVoice;

      // Rocket screams up into high sky arc then towards impact
      this.rampPannerPos(panner, rocketX * 0.5, 95, -120, time + 0.45);
      this.rampPannerPos(panner, rocketX * 0.2, 10, -40, time + 0.9);

      const whistle = ctx.createOscillator();
      const whistleGain = ctx.createGain();
      whistle.type = 'sawtooth';
      whistle.frequency.setValueAtTime(750 + Math.random() * 250, time);
      whistle.frequency.exponentialRampToValueAtTime(2400 + Math.random() * 300, time + 0.45);
      whistle.frequency.exponentialRampToValueAtTime(420, time + 0.9);

      whistleGain.gain.setValueAtTime(0.01, time);
      whistleGain.gain.linearRampToValueAtTime(0.38, time + 0.3);
      whistleGain.gain.exponentialRampToValueAtTime(0.01, time + 0.9);

      const hissBuf = this.createBrownNoiseBuffer(0.9);
      const hiss = ctx.createBufferSource();
      hiss.buffer = hissBuf;
      const hissGain = ctx.createGain();
      hissGain.gain.setValueAtTime(0.38, time);
      hissGain.gain.exponentialRampToValueAtTime(0.01, time + 0.85);

      whistle.connect(whistleGain);
      whistleGain.connect(input);
      hiss.connect(hissGain);
      hissGain.connect(input);

      whistle.start(time);
      hiss.start(time);
      whistle.stop(time + 0.95);
      hiss.stop(time + 0.9);
    }

    setTimeout(() => {
      for (let k = 0; k < 5; k++) {
        setTimeout(() => {
          this.playArtilleryBlast('far', typeof pan === 'number' ? pan + (Math.random() * 0.4 - 0.2) : pan);
        }, k * 240);
      }
    }, 1200);
  }

  /**
   * 105mm Howitzer & Heavy Artillery Blast with shrapnel and seismic rumble in 3D
   */
  public playArtilleryBlast(distance: 'near' | 'mid' | 'far' = 'near', pan: number | TrenchDirection = 0) {
    const voice = this.createVoice(distance, pan, 0.62);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    if (distance === 'near') {
      const shriek = ctx.createOscillator();
      const shriekGain = ctx.createGain();
      shriek.type = 'sine';
      shriek.frequency.setValueAtTime(2200, now);
      shriek.frequency.exponentialRampToValueAtTime(450, now + 0.16);
      shriekGain.gain.setValueAtTime(0.25, now);
      shriekGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      shriek.connect(shriekGain);
      shriekGain.connect(input);
      shriek.start(now);
      shriek.stop(now + 0.18);
    }

    const blastTime = now + (distance === 'near' ? 0.12 : 0);

    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(80, blastTime);
    sub.frequency.exponentialRampToValueAtTime(16, blastTime + 1.3);
    subGain.gain.setValueAtTime(1.65, blastTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, blastTime + 1.4);

    const bufferSize = ctx.sampleRate * 1.6;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.19));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(distance === 'near' ? 2600 : 750, blastTime);
    filter.frequency.exponentialRampToValueAtTime(140, blastTime + 1.3);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1.4, blastTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, blastTime + 1.5);

    sub.connect(subGain);
    subGain.connect(input);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(input);

    sub.start(blastTime);
    noise.start(blastTime);
    sub.stop(blastTime + 1.45);
    noise.stop(blastTime + 1.6);
  }

  /**
   * Naval Bombardment (16-inch offshore battleships) in 3D
   */
  public playNavalBombardment() {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const voice = this.createVoice('far', -0.6, 0.7);
    if (!voice) return;
    const { input } = voice;

    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(42, now);
    sub.frequency.exponentialRampToValueAtTime(14, now + 2.8);
    subGain.gain.setValueAtTime(1.75, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    sub.connect(subGain);
    subGain.connect(input);
    sub.start(now);
    sub.stop(now + 3.1);

    this.playArtilleryBlast('far', -0.2);
  }

  /**
   * Hand Grenade (Stielhandgranate / Mk 2 Pineapple) in 3D:
   * Pin pulled in hand, thrown over parapet, detonation in crater
   */
  public playGrenade(distance: 'near' | 'mid' = 'near', pan: number | TrenchDirection = 0) {
    const throwCoords = { x: 0.3, y: 1.3, z: -0.5 };
    const voice = this.createVoice(distance, pan, 0.55, throwCoords);
    if (!voice) return;
    const { ctx, input, panner } = voice;
    const now = ctx.currentTime;

    // Pin pull
    const pin = ctx.createOscillator();
    const pinGain = ctx.createGain();
    pin.type = 'triangle';
    pin.frequency.setValueAtTime(2200, now);
    pinGain.gain.setValueAtTime(0.35, now);
    pinGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    pin.connect(pinGain);
    pinGain.connect(input);
    pin.start(now);
    pin.stop(now + 0.1);

    // Fuse burning noise while grenade is thrown into No Man's Land
    const fuseBuf = this.createBrownNoiseBuffer(0.9);
    const fuseNoise = ctx.createBufferSource();
    fuseNoise.buffer = fuseBuf;
    const fuseGain = ctx.createGain();
    fuseGain.gain.setValueAtTime(0.18, now);
    fuseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    fuseNoise.connect(fuseGain);
    fuseGain.connect(input);
    fuseNoise.start(now);
    fuseNoise.stop(now + 0.95);

    // Animate grenade trajectory arcing over sandbag parapet into crater
    const landCoords = this.calculateTrenchCoordinates(distance, pan);
    this.rampPannerPos(panner, landCoords.x * 0.4, 3.5, -8, now + 0.45);
    this.rampPannerPos(panner, landCoords.x, 0.8, landCoords.z, now + 0.95);

    setTimeout(() => {
      this.playArtilleryBlast(distance, pan);
    }, 950);
  }

  // -------------------------------------------------------------
  // ESTÍMULOS SENSORIAIS EM 1ª PESSOA (FIRST-PERSON SOLDIER SENSORY AUDIO)
  // -------------------------------------------------------------

  /**
   * Soldier's racing heartbeat (lub-dub) felt inside chest
   */
  public playHeartbeat() {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const playLub = (t: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(62, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.12);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.14);
    };

    // Lub
    playLub(now, 0.42);
    // Dub (slightly lower amplitude, 120ms later)
    playLub(now + 0.13, 0.28);
  }

  /**
   * Exhausted / frightened soldier breathing
   */
  public playHeavyBreathing(isInhale: boolean = true) {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const dur = isInhale ? 0.9 : 1.2;
    const buf = this.createPinkNoiseBuffer(dur);
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.2, now);

    const gain = ctx.createGain();

    if (isInhale) {
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(780, now + dur);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.22, now + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    } else {
      filter.frequency.setValueAtTime(720, now);
      filter.frequency.exponentialRampToValueAtTime(260, now + dur);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    }

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
    src.stop(now + dur + 0.05);
  }

  /**
   * Muddy combat boots sloshing along wooden trench duckboards
   */
  public playMudSteps() {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Wet mud squelch
    const mudBuf = this.createBrownNoiseBuffer(0.25);
    const mud = ctx.createBufferSource();
    mud.buffer = mudBuf;
    const mudFilter = ctx.createBiquadFilter();
    mudFilter.type = 'lowpass';
    mudFilter.frequency.setValueAtTime(800, now);
    mudFilter.frequency.exponentialRampToValueAtTime(220, now + 0.22);

    const mudGain = ctx.createGain();
    mudGain.gain.setValueAtTime(0.35, now);
    mudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    mud.connect(mudFilter);
    mudFilter.connect(mudGain);
    mudGain.connect(this.masterGain);
    mud.start(now);
    mud.stop(now + 0.25);

    // Duckboard plank creak
    const wood = ctx.createOscillator();
    const woodGain = ctx.createGain();
    wood.type = 'triangle';
    wood.frequency.setValueAtTime(140 + Math.random() * 40, now);
    wood.frequency.exponentialRampToValueAtTime(85, now + 0.18);
    woodGain.gain.setValueAtTime(0.12, now);
    woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    wood.connect(woodGain);
    woodGain.connect(this.masterGain);
    wood.start(now);
    wood.stop(now + 0.2);
  }

  /**
   * Shell shock tinnitus: piercing ringing + temporary deafness
   */
  public playTinnitus(durationSeconds: number = 4.5) {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Dual ringing oscillators for realistic psychoacoustic ringing
    const ring1 = ctx.createOscillator();
    const ring2 = ctx.createOscillator();
    const ringGain = ctx.createGain();

    ring1.type = 'sine';
    ring1.frequency.setValueAtTime(3950, now);

    ring2.type = 'sine';
    ring2.frequency.setValueAtTime(3954, now); // 4Hz beat frequency

    ringGain.gain.setValueAtTime(0.32, now);
    ringGain.gain.setValueAtTime(0.32, now + durationSeconds * 0.4);
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

    ring1.connect(ringGain);
    ring2.connect(ringGain);
    ringGain.connect(this.masterGain);

    ring1.start(now);
    ring2.start(now);
    ring1.stop(now + durationSeconds + 0.1);
    ring2.stop(now + durationSeconds + 0.1);
  }

  /**
   * Parachute illumination flare launch into the night sky
   */
  public playFlareLaunch() {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Pneumatic mortar thump
    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    pop.type = 'sine';
    pop.frequency.setValueAtTime(140, now);
    pop.frequency.exponentialRampToValueAtTime(35, now + 0.12);
    popGain.gain.setValueAtTime(0.6, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    pop.connect(popGain);
    popGain.connect(this.masterGain);
    pop.start(now);
    pop.stop(now + 0.15);

    // Ascending rocket whistle
    const hiss = ctx.createBufferSource();
    hiss.buffer = this.createPinkNoiseBuffer(1.4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now + 0.05);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 1.2);
    const hissGain = ctx.createGain();
    hissGain.gain.setValueAtTime(0.01, now + 0.05);
    hissGain.gain.linearRampToValueAtTime(0.35, now + 0.8);
    hissGain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);

    hiss.connect(filter);
    filter.connect(hissGain);
    hissGain.connect(this.masterGain);
    hiss.start(now + 0.05);
    hiss.stop(now + 1.45);

    // Ignition pop in the sky at 1.4s
    setTimeout(() => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const burst = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      burst.type = 'triangle';
      burst.frequency.setValueAtTime(450, t);
      burst.frequency.exponentialRampToValueAtTime(120, t + 0.2);
      bGain.gain.setValueAtTime(0.4, t);
      bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      burst.connect(bGain);
      bGain.connect(this.masterGain);
      burst.start(t);
      burst.stop(t + 0.26);
    }, 1400);
  }

  /**
   * Dirt, soil & debris raining down onto soldier's steel M1 helmet
   */
  public playDirtFallingOnHelmet() {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const totalPellets = 16;
    for (let i = 0; i < totalPellets; i++) {
      const delay = Math.random() * 1.5;
      const t = now + delay;
      // Metallic tink on helmet
      const tink = ctx.createOscillator();
      const tinkGain = ctx.createGain();
      tink.type = 'triangle';
      tink.frequency.setValueAtTime(1800 + Math.random() * 2200, t);
      tinkGain.gain.setValueAtTime(0.08 + Math.random() * 0.1, t);
      tinkGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      tink.connect(tinkGain);
      tinkGain.connect(this.masterGain);
      tink.start(t);
      tink.stop(t + 0.05);
    }
  }

  // -------------------------------------------------------------
  // CAMADAS CONTÍNUAS DA TRINCHEIRA (CONTINUOUS TRENCH AMBIENCE)
  // -------------------------------------------------------------

  public setRain(enable: boolean) {
    this.ambientState.rain = enable;
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;

    if (enable) {
      if (this.rainNode) return;
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.9, this.ctx.currentTime);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.rainGain.gain.linearRampToValueAtTime(0.28, this.ctx.currentTime + 1.0);

      noise.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(this.masterGain);
      noise.start();
      this.rainNode = noise;

      // Random mud & duckboard drip drops
      const triggerDrip = () => {
        if (!this.ambientState.rain || !this.ctx || !this.masterGain) return;
        const dripTime = this.ctx.currentTime;
        const drip = this.ctx.createOscillator();
        const dG = this.ctx.createGain();
        drip.type = 'sine';
        drip.frequency.setValueAtTime(1400 + Math.random() * 800, dripTime);
        drip.frequency.exponentialRampToValueAtTime(300, dripTime + 0.05);
        dG.gain.setValueAtTime(0.04, dripTime);
        dG.gain.exponentialRampToValueAtTime(0.001, dripTime + 0.05);
        drip.connect(dG);
        dG.connect(this.masterGain);
        drip.start(dripTime);
        drip.stop(dripTime + 0.06);

        if (this.ambientState.rain) {
          this.rainDripsInterval = window.setTimeout(triggerDrip, 180 + Math.random() * 450);
        }
      };
      triggerDrip();
    } else {
      if (this.rainDripsInterval) {
        clearTimeout(this.rainDripsInterval);
        this.rainDripsInterval = null;
      }
      if (this.rainGain && this.ctx) {
        this.rainGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      }
      setTimeout(() => {
        if (this.rainNode) {
          try {
            (this.rainNode as AudioBufferSourceNode).stop();
          } catch {
            // ignore
          }
          this.rainNode = null;
        }
      }, 850);
    }
  }

  public setWind(enable: boolean) {
    this.ambientState.wind = enable;
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;

    if (enable) {
      if (this.windNode) return;
      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(160, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.windGain.gain.linearRampToValueAtTime(0.38, this.ctx.currentTime + 1.2);

      noise.connect(filter);
      filter.connect(this.windGain);
      this.windGain.connect(this.masterGain);
      noise.start();
      this.windNode = noise;
    } else {
      if (this.windGain && this.ctx) {
        this.windGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      }
      setTimeout(() => {
        if (this.windNode) {
          try {
            (this.windNode as AudioBufferSourceNode).stop();
          } catch {
            // ignore
          }
          this.windNode = null;
        }
      }, 850);
    }
  }

  public setDistantWar(enable: boolean) {
    this.ambientState.distantWar = enable;
    if (!this.ensureRunning()) return;

    if (enable) {
      if (this.distantArtilleryInterval) return;
      const triggerRandomBoom = () => {
        if (!this.ambientState.distantWar) return;
        const pan = Math.random() * 1.6 - 0.8;
        this.playArtilleryBlast('far', pan);

        const nextDelay = 2000 + Math.random() * 4200;
        this.distantArtilleryInterval = window.setTimeout(triggerRandomBoom, nextDelay);
      };
      triggerRandomBoom();
    } else {
      if (this.distantArtilleryInterval) {
        clearTimeout(this.distantArtilleryInterval);
        this.distantArtilleryInterval = null;
      }
    }
  }

  public setRadio(enable: boolean) {
    this.ambientState.radio = enable;
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;

    if (enable) {
      if (this.radioNode) return;
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.18;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, this.ctx.currentTime);
      filter.Q.setValueAtTime(4.5, this.ctx.currentTime);

      this.radioGain = this.ctx.createGain();
      this.radioGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.radioGain.gain.linearRampToValueAtTime(0.14, this.ctx.currentTime + 0.6);

      noise.connect(filter);
      filter.connect(this.radioGain);
      this.radioGain.connect(this.masterGain);
      noise.start();
      this.radioNode = noise;

      // Realistic Morse code phrases
      const triggerMorse = () => {
        if (!this.ambientState.radio || !this.ctx || !this.masterGain) return;
        const morseTime = this.ctx.currentTime;
        const beeps = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < beeps; i++) {
          const t = morseTime + i * 0.13;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, t);
          g.gain.setValueAtTime(0.09, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.09);
        }
        if (this.ambientState.radio) {
          setTimeout(triggerMorse, 3200 + Math.random() * 4500);
        }
      };
      triggerMorse();
    } else {
      if (this.radioGain && this.ctx) {
        this.radioGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      }
      setTimeout(() => {
        if (this.radioNode) {
          try {
            (this.radioNode as AudioBufferSourceNode).stop();
          } catch {
            // ignore
          }
          this.radioNode = null;
        }
      }, 550);
    }
  }

  public stopAllAmbience() {
    this.setRain(false);
    this.setWind(false);
    this.setDistantWar(false);
    this.setRadio(false);
  }
}

export const soundEngine = new WWIISoundEngine();
