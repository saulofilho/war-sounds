/**
 * WWII Audio Engine: High-Fidelity Procedural Web Audio API Synthesizer
 * Enhanced with physical acoustic modeling:
 * - Supersonic muzzle crack & chamber explosion multi-stage physical modeling
 * - Waveshaping soft-clipping for raw kinetic punch and dynamic SPL saturation
 * - Brown/Pink noise generators for authentic combustion & dirt debris
 * - Harmonic synthesis for V-12/Radial aircraft engines and Maybach tank diesels
 * - Trench slap-back reflections, distance low-pass filtering, and spatial audio
 */

class WWIISoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiterNode: DynamicsCompressorNode | null = null;
  private distortionCurve: Float32Array | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

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

    // Limiter / Compressor to avoid harsh digital clipping while allowing high dynamic punch
    this.limiterNode = this.ctx.createDynamicsCompressor();
    this.limiterNode.threshold.setValueAtTime(-1.5, this.ctx.currentTime);
    this.limiterNode.knee.setValueAtTime(4, this.ctx.currentTime);
    this.limiterNode.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.limiterNode.attack.setValueAtTime(0.002, this.ctx.currentTime);
    this.limiterNode.release.setValueAtTime(0.15, this.ctx.currentTime);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    this.masterGain.connect(this.limiterNode);
    this.limiterNode.connect(this.ctx.destination);

    this.distortionCurve = this.makeDistortionCurve(20);
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
    this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : clamped, this.ctx.currentTime, 0.05);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Generates a soft-clipping saturation curve for realistic explosive pressure
   */
  private makeDistortionCurve(amount: number = 20): Float32Array {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  /**
   * Generates Brownian/Pink acoustic noise buffer for realistic explosions & wind
   */
  private createBrownNoiseBuffer(durationSec: number = 1.0): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not ready');
    const length = this.ctx.sampleRate * durationSec;
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Compensate gain
    }
    return buffer;
  }

  /**
   * Creates an acoustic channel voice with distance filtering, trench reflections and stereo pan
   */
  private createVoice(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return null;

    const voiceGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    // Distance low-pass filter & air absorption
    if (distance === 'near') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(19000, this.ctx.currentTime);
      voiceGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    } else if (distance === 'mid') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, this.ctx.currentTime);
      voiceGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, this.ctx.currentTime);
      voiceGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    }

    if (panner) {
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), this.ctx.currentTime);
      voiceGain.connect(filter);
      filter.connect(panner);
      panner.connect(this.masterGain);
    } else {
      voiceGain.connect(filter);
      filter.connect(this.masterGain);
    }

    // Trench boundary early reflection (slap-back echo of 45ms)
    if (distance === 'near') {
      const delay = this.ctx.createDelay();
      delay.delayTime.setValueAtTime(0.045, this.ctx.currentTime);
      const delayGain = this.ctx.createGain();
      delayGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      const delayFilter = this.ctx.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);

      voiceGain.connect(delay);
      delay.connect(delayFilter);
      delayFilter.connect(delayGain);
      delayGain.connect(panner || this.masterGain);
    }

    return {
      ctx: this.ctx,
      input: voiceGain,
      master: this.masterGain,
    };
  }

  // -------------------------------------------------------------
  // ARMAS DE INFANTARIA (WEAPONS)
  // -------------------------------------------------------------

  /**
   * M1 Garand: Semiautomatic .30-06 rifle shot with visceral shockwave & iconic en-bloc ping
   */
  public playM1Garand(shots: number = 8, withPing: boolean = true, distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;

    const playShot = (time: number) => {
      // 1. Supersonic Muzzle Crack (Sharp initial snap < 30ms)
      const crackBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const crackData = crackBuffer.getChannelData(0);
      for (let i = 0; i < crackData.length; i++) {
        crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
      }
      const crackSource = ctx.createBufferSource();
      crackSource.buffer = crackBuffer;
      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = 'bandpass';
      crackFilter.frequency.setValueAtTime(2600, time);
      crackFilter.Q.setValueAtTime(2.0, time);
      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(1.1, time);
      crackGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

      crackSource.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(input);
      crackSource.start(time);
      crackSource.stop(time + 0.08);

      // 2. Chamber combustion blast (Heavy low-mid body)
      const blastBuffer = this.createBrownNoiseBuffer(0.4);
      const blastSource = ctx.createBufferSource();
      blastSource.buffer = blastBuffer;
      const blastFilter = ctx.createBiquadFilter();
      blastFilter.type = 'lowpass';
      blastFilter.frequency.setValueAtTime(450, time);
      blastFilter.frequency.exponentialRampToValueAtTime(90, time + 0.35);
      const blastGain = ctx.createGain();
      blastGain.gain.setValueAtTime(1.4, time);
      blastGain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);

      blastSource.connect(blastFilter);
      blastFilter.connect(blastGain);
      blastGain.connect(input);
      blastSource.start(time);
      blastSource.stop(time + 0.4);

      // 3. Sub-bass thump (recoil shockwave)
      const thump = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thump.type = 'triangle';
      thump.frequency.setValueAtTime(170, time);
      thump.frequency.exponentialRampToValueAtTime(45, time + 0.14);
      thumpGain.gain.setValueAtTime(0.9, time);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

      thump.connect(thumpGain);
      thumpGain.connect(input);
      thump.start(time);
      thump.stop(time + 0.18);
    };

    const now = ctx.currentTime;
    const interval = 0.22;
    for (let i = 0; i < shots; i++) {
      playShot(now + i * interval);
    }

    // 4. Iconic En-Bloc Clip Ejection "PING!"
    if (withPing) {
      const pingTime = now + shots * interval + 0.08;
      this.playRealisticGarandPing(pingTime, input);
    }
  }

  private playRealisticGarandPing(time: number, dest: AudioNode) {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Harmonic bell modes of stamped spring steel
    const freqs = [2440, 3180, 4220];
    const decays = [0.85, 0.65, 0.4];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.35 / (idx + 1), time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decays[idx]);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + decays[idx] + 0.05);
    });

    // Follower bounce rattle
    setTimeout(() => {
      if (!this.ctx) return;
      const t = time + 0.12;
      const rattle = this.ctx.createOscillator();
      const rattleGain = this.ctx.createGain();
      rattle.type = 'triangle';
      rattle.frequency.setValueAtTime(1850, t);
      rattleGain.gain.setValueAtTime(0.08, t);
      rattleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      rattle.connect(rattleGain);
      rattleGain.connect(dest);
      rattle.start(t);
      rattle.stop(t + 0.1);
    }, 100);
  }

  /**
   * MG 42 "Hitler's Buzzsaw": 1200+ rpm ferocious ripped-cloth acoustic texture
   */
  public playMG42(burstDurationSec: number = 1.2, distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;

    const roundCount = Math.floor(burstDurationSec * 22); // ~22 rounds per sec
    const avgInterval = burstDurationSec / roundCount;
    const now = ctx.currentTime;

    for (let i = 0; i < roundCount; i++) {
      // Micro-jitter in cyclic rate
      const jitter = (Math.random() - 0.5) * 0.004;
      const shotTime = now + i * avgInterval + jitter;

      // 1. High-frequency gas rip & muzzle crack
      const crackBuf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const crackData = crackBuf.getChannelData(0);
      for (let j = 0; j < crackData.length; j++) {
        crackData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.006));
      }
      const crack = ctx.createBufferSource();
      crack.buffer = crackBuf;
      const crackFilt = ctx.createBiquadFilter();
      crackFilt.type = 'highpass';
      crackFilt.frequency.setValueAtTime(1400, shotTime);
      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.9, shotTime);
      crackGain.gain.exponentialRampToValueAtTime(0.01, shotTime + 0.038);

      crack.connect(crackFilt);
      crackFilt.connect(crackGain);
      crackGain.connect(input);
      crack.start(shotTime);
      crack.stop(shotTime + 0.04);

      // 2. Heavy cyclic punch
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = 'sawtooth';
      thud.frequency.setValueAtTime(155, shotTime);
      thud.frequency.exponentialRampToValueAtTime(45, shotTime + 0.035);
      thudGain.gain.setValueAtTime(0.7, shotTime);
      thudGain.gain.exponentialRampToValueAtTime(0.01, shotTime + 0.04);

      thud.connect(thudGain);
      thudGain.connect(input);
      thud.start(shotTime);
      thud.stop(shotTime + 0.045);
    }
  }

  /**
   * Kar98k Bolt Action: Explosive 7.92mm crack followed by 3-stage mechanical bolt cycle
   */
  public playKar98k(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    // 1. Massive hypersonic muzzle crack
    const bufSize = ctx.sampleRate * 0.6;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.055));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1900, now);
    filter.Q.setValueAtTime(1.5, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(input);
    noise.start(now);
    noise.stop(now + 0.6);

    // 2. Low-frequency ground shock
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thump: thud.type = 'triangle';
    thud.frequency.setValueAtTime(180, now);
    thud.frequency.exponentialRampToValueAtTime(32, now + 0.22);
    thudGain.gain.setValueAtTime(1.1, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    thud.connect(thudGain);
    thudGain.connect(input);
    thud.start(now);
    thud.stop(now + 0.28);

    // 3. Realistic 3-Stage Bolt Action Reload
    // Stage A: Handle lift at +0.65s
    const liftTime = now + 0.65;
    const liftOsc = ctx.createOscillator();
    const liftGain = ctx.createGain();
    liftOsc.type = 'sine';
    liftOsc.frequency.setValueAtTime(1100, liftTime);
    liftGain.gain.setValueAtTime(0.2, liftTime);
    liftGain.gain.exponentialRampToValueAtTime(0.001, liftTime + 0.08);
    liftOsc.connect(liftGain);
    liftGain.connect(input);
    liftOsc.start(liftTime);
    liftOsc.stop(liftTime + 0.09);

    // Stage B: Bolt pulled back & shell ejects at +0.82s
    const pullTime = now + 0.82;
    const pullOsc = ctx.createOscillator();
    const pullGain = ctx.createGain();
    pullOsc.type = 'triangle';
    pullOsc.frequency.setValueAtTime(750, pullTime);
    pullOsc.frequency.linearRampToValueAtTime(1400, pullTime + 0.1);
    pullGain.gain.setValueAtTime(0.25, pullTime);
    pullGain.gain.exponentialRampToValueAtTime(0.001, pullTime + 0.12);
    pullOsc.connect(pullGain);
    pullGain.connect(input);
    pullOsc.start(pullTime);
    pullOsc.stop(pullTime + 0.13);

    // Stage C: Bolt pushed forward & locked at +1.1s
    const lockTime = now + 1.1;
    const lockOsc = ctx.createOscillator();
    const lockGain = ctx.createGain();
    lockOsc.type = 'sine';
    lockOsc.frequency.setValueAtTime(1600, lockTime);
    lockOsc.frequency.setValueAtTime(950, lockTime + 0.06);
    lockGain.gain.setValueAtTime(0.3, lockTime);
    lockGain.gain.exponentialRampToValueAtTime(0.001, lockTime + 0.1);
    lockOsc.connect(lockGain);
    lockGain.connect(input);
    lockOsc.start(lockTime);
    lockOsc.stop(lockTime + 0.12);
  }

  /**
   * Thompson M1A1: Heavy submachine gun .45 ACP thumps with cyclic bolt rattle
   */
  public playThompson(burstCount: number = 8, distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;
    const interval = 0.088; // ~680 rpm

    for (let i = 0; i < burstCount; i++) {
      const time = now + i * interval;
      // Deep .45 caliber subsonic heavy thud
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(125, time);
      osc.frequency.exponentialRampToValueAtTime(38, time + 0.07);
      oscGain.gain.setValueAtTime(0.95, time);
      oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.075);

      // Noise pop
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.018));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.7, time);
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
   * Trench Mortar: Hollow tube "plump", ascending/descending flight whistle, crater explosion
   */
  public playMortar(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    // Tube "plump" resonance
    const tubeOsc = ctx.createOscillator();
    const tubeGain = ctx.createGain();
    tubeOsc.type = 'sine';
    tubeOsc.frequency.setValueAtTime(95, now);
    tubeOsc.frequency.exponentialRampToValueAtTime(25, now + 0.18);
    tubeGain.gain.setValueAtTime(1.2, now);
    tubeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    tubeOsc.connect(tubeGain);
    tubeGain.connect(input);
    tubeOsc.start(now);
    tubeOsc.stop(now + 0.25);

    // Whistling aerodynamic shell trajectory
    const whistle = ctx.createOscillator();
    const whistleGain = ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(1100, now + 0.2);
    whistle.frequency.exponentialRampToValueAtTime(2800, now + 0.9);
    whistle.frequency.exponentialRampToValueAtTime(650, now + 1.6);

    whistleGain.gain.setValueAtTime(0.001, now + 0.2);
    whistleGain.gain.linearRampToValueAtTime(0.25, now + 0.9);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    whistle.connect(whistleGain);
    whistleGain.connect(input);
    whistle.start(now + 0.2);
    whistle.stop(now + 1.65);

    // Impact detonation at +1.6s
    setTimeout(() => {
      this.playArtilleryBlast(distance === 'near' ? 'mid' : 'far', pan);
    }, 1550);
  }

  // -------------------------------------------------------------
  // AVIÕES (AIRCRAFT)
  // -------------------------------------------------------------

  /**
   * Junkers Ju 87 "Stuka": Screaming Jericho Trumpet sirens + Jumo V12 engine + bomb explosion
   */
  public playStukaDive(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;
    const duration = 4.4;

    // Dual detuned screaming sirens (The Jericho Trumpet)
    const siren1 = ctx.createOscillator();
    const siren2 = ctx.createOscillator();
    const sirenGain = ctx.createGain();

    siren1.type = 'sawtooth';
    siren2.type = 'square';

    // Pitch rises terrifically as airspeed accelerates in the dive, then peaks and falls
    siren1.frequency.setValueAtTime(420, now);
    siren1.frequency.exponentialRampToValueAtTime(1620, now + 2.8);
    siren1.frequency.exponentialRampToValueAtTime(280, now + duration);

    siren2.frequency.setValueAtTime(435, now);
    siren2.frequency.exponentialRampToValueAtTime(1650, now + 2.8);
    siren2.frequency.exponentialRampToValueAtTime(290, now + duration);

    sirenGain.gain.setValueAtTime(0.01, now);
    sirenGain.gain.exponentialRampToValueAtTime(0.55, now + 2.6);
    sirenGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.linearRampToValueAtTime(1800, now + 2.8);
    filter.Q.setValueAtTime(3.2, now);

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
    windFilt.frequency.setValueAtTime(600, now);
    windFilt.frequency.linearRampToValueAtTime(2200, now + 2.8);
    const windG = ctx.createGain();
    windG.gain.setValueAtTime(0.05, now);
    windG.gain.linearRampToValueAtTime(0.4, now + 2.6);
    windG.gain.exponentialRampToValueAtTime(0.01, now + duration);

    windSource.connect(windFilt);
    windFilt.connect(windG);
    windG.connect(input);

    // Jumo 211 inverted V-12 roar
    const engineOsc = ctx.createOscillator();
    const engineGain = ctx.createGain();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.setValueAtTime(90, now);
    engineOsc.frequency.linearRampToValueAtTime(220, now + 2.8);
    engineOsc.frequency.linearRampToValueAtTime(110, now + duration);

    engineGain.gain.setValueAtTime(0.05, now);
    engineGain.gain.linearRampToValueAtTime(0.45, now + 2.7);
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

    // Bomb Detonation at 2.85s
    setTimeout(() => {
      this.playArtilleryBlast('near', pan);
    }, 2850);
  }

  /**
   * Supermarine Spitfire: Harmonically rich Rolls-Royce Merlin V-12 + strafing machine gun pass
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

    // Merlin V12 firing order harmonic series
    const fundamental = 160;
    const harmonics = [fundamental, fundamental * 1.5, fundamental * 2, fundamental * 3];

    harmonics.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';

      // Doppler shift
      osc.frequency.setValueAtTime(freq * 1.15, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + 1.4);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.75, now + duration);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.3 / (idx + 1), now + 1.4);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + duration);
    });

    // Twin-wing strafing bursts at 1.3s
    setTimeout(() => {
      this.playBrowningBurst();
    }, 1250);
  }

  private playBrowningBurst() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    for (let i = 0; i < 16; i++) {
      const time = now + i * 0.052;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.007));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.45, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.048);

      noise.connect(gain);
      gain.connect(this.masterGain);
      noise.start(time);
      noise.stop(time + 0.052);
    }
  }

  /**
   * B-17 Flying Fortress Formation: Multi-engine acoustic phase beating & falling bombs
   */
  public playB17Formation() {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = 5.5;

    // Heterodyning frequencies simulating multiple heavy radial engines in combat box
    const freqs = [76.5, 78.2, 80.0, 81.8];
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.55, now + 2.5);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(260, now);
      osc.connect(f);
      f.connect(gain);
      osc.start(now);
      osc.stop(now + duration);
    });

    gain.connect(this.masterGain);

    // Falling bomb whistles
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
   * Tiger I: 23L Maybach HL230 V12 diesel clatter, steel track link squeal, and 88mm KwK 36 cannon fire
   */
  public playTigerI(fireCannon: boolean = true, distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;
    const duration = fireCannon ? 3.8 : 2.5;

    // Heavy Maybach V-12 diesel rumble
    const engineOsc = ctx.createOscillator();
    const engineGain = ctx.createGain();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.setValueAtTime(42, now);
    engineOsc.frequency.linearRampToValueAtTime(68, now + 1.2);
    engineOsc.frequency.linearRampToValueAtTime(46, now + duration);

    engineGain.gain.setValueAtTime(0.15, now);
    engineGain.gain.linearRampToValueAtTime(0.65, now + 0.8);
    engineGain.gain.exponentialRampToValueAtTime(0.02, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);

    engineOsc.connect(filter);
    filter.connect(engineGain);
    engineGain.connect(input);
    engineOsc.start(now);
    engineOsc.stop(now + duration);

    // Metal track link squeaks
    for (let i = 0; i < 5; i++) {
      const squeakTime = now + 0.2 + i * 0.42;
      const squeak = ctx.createOscillator();
      const squeakGain = ctx.createGain();
      squeak.type = 'sine';
      squeak.frequency.setValueAtTime(1900 + Math.random() * 350, squeakTime);
      squeak.frequency.exponentialRampToValueAtTime(750, squeakTime + 0.16);
      squeakGain.gain.setValueAtTime(0.15, squeakTime);
      squeakGain.gain.exponentialRampToValueAtTime(0.001, squeakTime + 0.17);

      squeak.connect(squeakGain);
      squeakGain.connect(input);
      squeak.start(squeakTime);
      squeak.stop(squeakTime + 0.18);
    }

    // 88mm KwK 36 Cannon
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
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    // Sub-bass crater wave
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(95, now);
    sub.frequency.exponentialRampToValueAtTime(18, now + 0.7);
    subGain.gain.setValueAtTime(1.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    // Explosive noise burst
    const bufSize = ctx.sampleRate * 0.9;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.09));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1.3, now);
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
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(52, now);
    oscGain.gain.setValueAtTime(0.32, now);
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
    const voice = this.createVoice(distance, pan);
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
      // High-pitched screeching rocket whoosh
      const whistle = ctx.createOscillator();
      const whistleGain = ctx.createGain();
      whistle.type = 'sawtooth';
      whistle.frequency.setValueAtTime(750 + Math.random() * 250, time);
      whistle.frequency.exponentialRampToValueAtTime(2400 + Math.random() * 300, time + 0.45);
      whistle.frequency.exponentialRampToValueAtTime(420, time + 0.9);

      whistleGain.gain.setValueAtTime(0.01, time);
      whistleGain.gain.linearRampToValueAtTime(0.35, time + 0.3);
      whistleGain.gain.exponentialRampToValueAtTime(0.01, time + 0.9);

      // Rocket solid propellant hiss
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

    // Delayed crater explosions on the horizon
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
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    // Incoming shriek just before impact
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

    // Deep sub-bass crater rumble
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(80, blastTime);
    sub.frequency.exponentialRampToValueAtTime(16, blastTime + 1.3);
    subGain.gain.setValueAtTime(1.6, blastTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, blastTime + 1.4);

    // Heavy dirt & explosive expansion noise
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
    subGain.gain.setValueAtTime(1.7, now);
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
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    // Pin & spoon snap
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

    // Fuse hiss with realistic sizzle
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

      // Realistic random mud / duckboard drip drops
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
