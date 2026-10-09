/**
 * WWII Audio Engine: High-Fidelity Procedural Web Audio API Synthesizer (V3 Cinematic Edition)
 * Enhanced with advanced physical acoustic modeling:
 * - Procedural stereo Convolution Reverb Impulse Response (earthen trench & open battlefield reflections)
 * - HRTF 3D Binaural Spatial Audio panning
 * - Real-time AnalyserNode for audio visualization and acoustic radar
 * - Supersonic Mach cone crack + Chamber gas combustion multi-stage physics
 * - Multi-harmonic engine synthesizers for Rolls-Royce Merlin, Maybach V-12, and Wright radials
 * - Stuka dual-siren aerodynamic flutter tracking dive velocity
 * - M1 Garand ping with steel en-bloc clip resonance and ground bounce
 * - 4-stage Kar98k mechanical bolt manipulation sequence
 * - Multi-layered continuous trench ambience with dynamic rain drips, wind howl, and distance war
 */

class WWIISoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private convolverNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  public analyserNode: AnalyserNode | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  public isBinauralMode: boolean = true;

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

    // Trench Reverb / Impulse Response
    this.convolverNode = this.ctx.createConvolver();
    this.convolverNode.buffer = this.generateTrenchImpulseResponse(1.8, 2.2);

    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

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

  /**
   * Generates a stereo impulse response modeling a deep earthen trench with wooden revetments
   */
  private generateTrenchImpulseResponse(durationSec: number = 1.6, decay: number = 2.4): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const rate = this.ctx.sampleRate;
    const length = rate * durationSec;
    const buffer = this.ctx.createBuffer(2, length, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / rate;
      // Exponential decay envelope with high frequency air damping
      const envelope = Math.exp(-t * decay);
      // Discrete early reflection spikes in first 60ms
      const isEarly = t < 0.06;
      const spike = isEarly && (i % Math.floor(rate * 0.012) === 0) ? 1.8 : 1.0;

      left[i] = (Math.random() * 2 - 1) * envelope * spike * 0.5;
      right[i] = (Math.random() * 2 - 1) * envelope * spike * 0.5;
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
   * Creates an acoustic channel voice with spatialization, distance low-pass, and trench reverb send
   */
  private createVoice(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0, reverbSendAmount: number = 0.25) {
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
      distanceFilter.frequency.setValueAtTime(3600, ctx.currentTime);
      voiceGain.gain.setValueAtTime(0.72, ctx.currentTime);
    } else {
      distanceFilter.type = 'lowpass';
      distanceFilter.frequency.setValueAtTime(950, ctx.currentTime);
      voiceGain.gain.setValueAtTime(0.45, ctx.currentTime);
    }

    // Panning (HRTF 3D spatializer if binaural, stereo panner otherwise)
    let pannerNode: StereoPannerNode | PannerNode | null = null;
    if (this.isBinauralMode && ctx.createPanner) {
      const p = ctx.createPanner();
      p.panningModel = 'HRTF';
      p.distanceModel = 'inverse';
      p.positionX.setValueAtTime(pan * 4, ctx.currentTime);
      p.positionY.setValueAtTime(0, ctx.currentTime);
      p.positionZ.setValueAtTime(distance === 'near' ? -2 : distance === 'mid' ? -8 : -20, ctx.currentTime);
      pannerNode = p;
    } else if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), ctx.currentTime);
      pannerNode = p;
    }

    // Connect voice chain
    voiceGain.connect(distanceFilter);

    if (pannerNode) {
      distanceFilter.connect(pannerNode);
      pannerNode.connect(this.masterGain);
    } else {
      distanceFilter.connect(this.masterGain);
    }

    // Send to trench convolution reverb
    if (this.convolverNode && reverbSendAmount > 0) {
      const sendGain = ctx.createGain();
      sendGain.gain.setValueAtTime(reverbSendAmount, ctx.currentTime);
      distanceFilter.connect(sendGain);
      sendGain.connect(this.convolverNode);
    }

    return {
      ctx,
      input: voiceGain,
      master: this.masterGain,
    };
  }

  // -------------------------------------------------------------
  // ARMAS DE INFANTARIA (WEAPONS)
  // -------------------------------------------------------------

  /**
   * M1 Garand: Multi-stage supersonic rifle crack + chamber detonation + en-bloc ping & ground bounce
   */
  public playM1Garand(shots: number = 8, withPing: boolean = true, distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
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
  public playMG42(burstDurationSec: number = 1.2, distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
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
  public playKar98k(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
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
    // A. Handle Lift at +0.62s
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

    // B. Bolt pulled back at +0.8s
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

    // C. Spent brass casing hitting trench wood at +0.98s
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

    // D. Bolt rammed forward & locked at +1.15s
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
  public playThompson(burstCount: number = 8, distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
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
   * Trench Mortar: Hollow tube thump + ascending/descending flight whistle + crater blast
   */
  public playMortar(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan, 0.45);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    // Tube "plump"
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

    // Whistling flight trajectory
    const whistle = ctx.createOscillator();
    const whistleGain = ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(1050, now + 0.2);
    whistle.frequency.exponentialRampToValueAtTime(2950, now + 0.9);
    whistle.frequency.exponentialRampToValueAtTime(620, now + 1.6);

    whistleGain.gain.setValueAtTime(0.001, now + 0.2);
    whistleGain.gain.linearRampToValueAtTime(0.28, now + 0.9);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    whistle.connect(whistleGain);
    whistleGain.connect(input);
    whistle.start(now + 0.2);
    whistle.stop(now + 1.65);

    setTimeout(() => {
      this.playArtilleryBlast(distance === 'near' ? 'mid' : 'far', pan);
    }, 1550);
  }

  // -------------------------------------------------------------
  // AVIÕES (AIRCRAFT)
  // -------------------------------------------------------------

  /**
   * Junkers Ju 87 "Stuka": Dual Jericho Trumpet sirens with acoustic waver + Jumo V12 + bomb impact
   */
  public playStukaDive(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan, 0.5);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;
    const duration = 4.5;

    // Dual detuned screaming sirens (wing struts)
    const siren1 = ctx.createOscillator();
    const siren2 = ctx.createOscillator();
    const sirenGain = ctx.createGain();

    siren1.type = 'sawtooth';
    siren2.type = 'square';

    siren1.frequency.setValueAtTime(410, now);
    siren1.frequency.exponentialRampToValueAtTime(1680, now + 2.85);
    siren1.frequency.exponentialRampToValueAtTime(260, now + duration);

    siren2.frequency.setValueAtTime(425, now);
    siren2.frequency.exponentialRampToValueAtTime(1710, now + 2.85);
    siren2.frequency.exponentialRampToValueAtTime(270, now + duration);

    sirenGain.gain.setValueAtTime(0.01, now);
    sirenGain.gain.exponentialRampToValueAtTime(0.58, now + 2.65);
    sirenGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, now);
    filter.frequency.linearRampToValueAtTime(1850, now + 2.85);
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
    windFilt.frequency.linearRampToValueAtTime(2400, now + 2.85);
    const windG = ctx.createGain();
    windG.gain.setValueAtTime(0.05, now);
    windG.gain.linearRampToValueAtTime(0.45, now + 2.65);
    windG.gain.exponentialRampToValueAtTime(0.01, now + duration);

    windSource.connect(windFilt);
    windFilt.connect(windG);
    windG.connect(input);

    // Jumo 211 inverted V-12 roar
    const engineOsc = ctx.createOscillator();
    const engineGain = ctx.createGain();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.setValueAtTime(92, now);
    engineOsc.frequency.linearRampToValueAtTime(230, now + 2.85);
    engineOsc.frequency.linearRampToValueAtTime(105, now + duration);

    engineGain.gain.setValueAtTime(0.05, now);
    engineGain.gain.linearRampToValueAtTime(0.48, now + 2.7);
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

    // Bomb detonation
    setTimeout(() => {
      this.playArtilleryBlast('near', pan);
    }, 2850);
  }

  /**
   * Supermarine Spitfire: Harmonically rich Rolls-Royce Merlin V-12 + 8-gun strafe
   */
  public playSpitfire(panFrom: number = -1, panTo: number = 1) {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = 3.6;

    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (panner) {
      panner.pan.setValueAtTime(panFrom, now);
      panner.pan.linearRampToValueAtTime(panTo, now + duration);
      panner.connect(this.masterGain);
    }

    const dest = panner || this.masterGain;

    const fundamental = 165;
    const harmonics = [fundamental, fundamental * 1.5, fundamental * 2, fundamental * 3];

    harmonics.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';

      osc.frequency.setValueAtTime(freq * 1.15, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + 1.4);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.75, now + duration);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.35 / (idx + 1), now + 1.4);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + duration);
    });

    // Strafing machine guns
    setTimeout(() => {
      this.playBrowningBurst();
    }, 1250);
  }

  private playBrowningBurst() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    for (let i = 0; i < 18; i++) {
      const time = now + i * 0.05;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.007));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.48, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.045);

      noise.connect(gain);
      gain.connect(this.masterGain);
      noise.start(time);
      noise.stop(time + 0.05);
    }
  }

  /**
   * B-17 Flying Fortress Formation: Multi-engine phase beating + cascading bombs
   */
  public playB17Formation() {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = 5.6;

    const freqs = [76.5, 78.2, 80.0, 81.8];
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.58, now + 2.5);
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

    gain.connect(this.masterGain);

    setTimeout(() => {
      this.playBombDropWhistle();
    }, 1800);
    setTimeout(() => {
      this.playBombDropWhistle();
    }, 2300);
    setTimeout(() => {
      this.playArtilleryBlast('far', -0.3);
    }, 3400);
    setTimeout(() => {
      this.playArtilleryBlast('mid', 0.4);
    }, 4100);
  }

  private playBombDropWhistle() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const whistle = ctx.createOscillator();
    const gain = ctx.createGain();

    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(3400, now);
    whistle.frequency.exponentialRampToValueAtTime(650, now + 1.5);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    whistle.connect(gain);
    gain.connect(this.masterGain);
    whistle.start(now);
    whistle.stop(now + 1.55);
  }

  // -------------------------------------------------------------
  // TANQUES E BLINDADOS (TANKS)
  // -------------------------------------------------------------

  /**
   * Tiger I: 23L Maybach V12 diesel rumble + metal track squeals + 88mm KwK 36 cannon fire
   */
  public playTigerI(fireCannon: boolean = true, distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
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
   * 88mm KwK 36 Cannon: Hypersonic muzzle blast + deep subsonic pressure wave
   */
  public play88mmCannon(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan, 0.5);
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
   * T-34/76: Rugged Soviet Kharkiv V-2 diesel engine clatter + 76.2mm cannon
   */
  public playT34(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
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
   * M4 Sherman: Continental Radial engine vibration and 75mm gun
   */
  public playSherman(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
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
  // EXPLOSÕES & ARTILHARIA (ARTILLERY & EXPLOSIONS)
  // -------------------------------------------------------------

  /**
   * Katyusha BM-13 "Stalin's Organ": Banshee rocket launches in salvo with overlapping whistles
   */
  public playKatyushaSalvo(salvoCount: number = 10, pan: number = -0.5) {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    for (let i = 0; i < salvoCount; i++) {
      const time = now + i * 0.17;
      const whistle = ctx.createOscillator();
      const whistleGain = ctx.createGain();
      whistle.type = 'sawtooth';
      whistle.frequency.setValueAtTime(750 + Math.random() * 250, time);
      whistle.frequency.exponentialRampToValueAtTime(2400 + Math.random() * 300, time + 0.45);
      whistle.frequency.exponentialRampToValueAtTime(420, time + 0.9);

      whistleGain.gain.setValueAtTime(0.01, time);
      whistleGain.gain.linearRampToValueAtTime(0.35, time + 0.3);
      whistleGain.gain.exponentialRampToValueAtTime(0.01, time + 0.9);

      const hissBuf = this.createBrownNoiseBuffer(0.9);
      const hiss = ctx.createBufferSource();
      hiss.buffer = hissBuf;
      const hissGain = ctx.createGain();
      hissGain.gain.setValueAtTime(0.35, time);
      hissGain.gain.exponentialRampToValueAtTime(0.01, time + 0.85);

      whistle.connect(whistleGain);
      whistleGain.connect(this.masterGain);
      hiss.connect(hissGain);
      hissGain.connect(this.masterGain);

      whistle.start(time);
      hiss.start(time);
      whistle.stop(time + 0.95);
      hiss.stop(time + 0.9);
    }

    setTimeout(() => {
      for (let k = 0; k < 5; k++) {
        setTimeout(() => {
          this.playArtilleryBlast('far', pan + (Math.random() * 0.4 - 0.2));
        }, k * 240);
      }
    }, 1200);
  }

  /**
   * 105mm Howitzer & Heavy Artillery Blast with shrapnel and seismic rumble
   */
  public playArtilleryBlast(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan, 0.6);
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
   * Naval Bombardment (16-inch offshore couraçados)
   */
  public playNavalBombardment() {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(42, now);
    sub.frequency.exponentialRampToValueAtTime(14, now + 2.8);
    subGain.gain.setValueAtTime(1.75, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 3.1);

    this.playArtilleryBlast('far', -0.2);
  }

  /**
   * Hand Grenade (Stielhandgranate / Mk 2 Pineapple)
   */
  public playGrenade(distance: 'near' | 'mid' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan, 0.5);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

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

    setTimeout(() => {
      this.playArtilleryBlast(distance, pan);
    }, 950);
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
