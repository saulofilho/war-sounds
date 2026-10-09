/**
 * WWII Audio Engine: Procedural Web Audio API sound synthesizer
 * Simulates historically accurate sounds of WWII weaponry, aircraft, tanks,
 * explosions, and continuous trench ambience with spatial & distance filtering.
 */

class WWIISoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  // Ambience nodes
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private windNode: AudioNode | null = null;
  private windGain: GainNode | null = null;
  private distantArtilleryInterval: number | null = null;
  private radioNode: AudioNode | null = null;
  private radioGain: GainNode | null = null;

  // Ambience state
  public ambientState = {
    rain: false,
    wind: false,
    distantWar: false,
    radio: false,
  };

  // Reverb buffer
  private reverbBuffer: AudioBuffer | null = null;

  public init() {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    this.createImpulseResponse();
    this.isInitialized = true;
  }

  public getContext(): AudioContext | null {
    if (!this.ctx) {
      this.init();
    }
    return this.ctx;
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

  private createImpulseResponse() {
    if (!this.ctx) return;
    const rate = this.ctx.sampleRate;
    const length = rate * 2.2;
    const decay = 2.0;
    const buffer = this.ctx.createBuffer(2, length, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const factor = Math.exp(-n * decay * 3.5);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    this.reverbBuffer = buffer;
  }

  /**
   * Helper to build a sound channel with optional distance & pan
   */
  private createVoice(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return null;

    const voiceGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    // Apply distance acoustic attenuation
    if (distance === 'near') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(18000, this.ctx.currentTime);
      voiceGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    } else if (distance === 'mid') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3500, this.ctx.currentTime);
      voiceGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
    } else {
      // distant front
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);
      voiceGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
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

    return {
      ctx: this.ctx,
      input: voiceGain,
      destination: this.masterGain,
    };
  }

  // -------------------------------------------------------------
  // WEAPONS (ARMAS)
  // -------------------------------------------------------------

  /**
   * M1 Garand: Semi-automatic 8-round burst with the famous metallic ping
   */
  public playM1Garand(shots: number = 1, withPing: boolean = true, distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;

    const playSingleShot = (time: number) => {
      // Gunshot noise burst
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, time);
      filter.Q.setValueAtTime(1.2, time);

      const shotGain = ctx.createGain();
      shotGain.gain.setValueAtTime(1.0, time);
      shotGain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      // Low end punch (thud)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);

      oscGain.gain.setValueAtTime(0.9, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      noise.connect(filter);
      filter.connect(shotGain);
      shotGain.connect(input);

      osc.connect(oscGain);
      oscGain.connect(input);

      noise.start(time);
      osc.start(time);
      noise.stop(time + 0.4);
      osc.stop(time + 0.2);
    };

    const now = ctx.currentTime;
    for (let i = 0; i < shots; i++) {
      playSingleShot(now + i * 0.22);
    }

    // Iconic M1 Clip Eject "PING"
    if (withPing) {
      const pingTime = now + (shots > 1 ? shots * 0.22 + 0.08 : 0.42);
      this.playGarandPingAt(pingTime, input);
    }
  }

  private playGarandPingAt(time: number, dest: AudioNode) {
    if (!this.ctx) return;
    // The en-bloc clip ping resonates strongly at ~2450 Hz and ~3200 Hz
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2450, time);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3220, time);

    gainNode.gain.setValueAtTime(0.35, time);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.75);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(dest);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.8);
    osc2.stop(time + 0.8);
  }

  /**
   * MG 42 "Hitler's Buzzsaw": 1200 rpm rapid cycle burst
   */
  public playMG42(burstDurationSec: number = 0.9, distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;

    const roundCount = Math.floor(burstDurationSec * 20); // ~20 rounds per second = 1200 rpm
    const interval = burstDurationSec / roundCount;
    const now = ctx.currentTime;

    for (let i = 0; i < roundCount; i++) {
      const shotTime = now + i * interval;
      // High-frequency mechanical tear + snap
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.008));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1100, shotTime);

      const shotGain = ctx.createGain();
      shotGain.gain.setValueAtTime(0.8, shotTime);
      shotGain.gain.exponentialRampToValueAtTime(0.01, shotTime + interval * 0.85);

      // Low punch
      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = 'sawtooth';
      thud.frequency.setValueAtTime(140, shotTime);
      thud.frequency.exponentialRampToValueAtTime(50, shotTime + 0.04);
      thudGain.gain.setValueAtTime(0.4, shotTime);
      thudGain.gain.exponentialRampToValueAtTime(0.001, shotTime + 0.04);

      noise.connect(filter);
      filter.connect(shotGain);
      shotGain.connect(input);

      thud.connect(thudGain);
      thudGain.connect(input);

      noise.start(shotTime);
      thud.start(shotTime);
      noise.stop(shotTime + 0.05);
      thud.stop(shotTime + 0.05);
    }
  }

  /**
   * Kar98k Bolt-Action Rifle: Sharp single crack + mechanical bolt cycle
   */
  public playKar98k(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    // Heavy 7.92mm crack
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.045));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    // Deep muzzle resonance
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.16);
    oscGain.gain.setValueAtTime(0.9, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(input);
    osc.connect(oscGain);
    oscGain.connect(input);

    noise.start(now);
    osc.start(now);
    noise.stop(now + 0.5);
    osc.stop(now + 0.2);

    // Bolt action sound (click-clack) at +0.7s
    const boltTime = now + 0.65;
    const boltOsc = ctx.createOscillator();
    const boltGain = ctx.createGain();
    boltOsc.type = 'sine';
    boltOsc.frequency.setValueAtTime(900, boltTime);
    boltOsc.frequency.setValueAtTime(1400, boltTime + 0.1);
    boltGain.gain.setValueAtTime(0.2, boltTime);
    boltGain.gain.exponentialRampToValueAtTime(0.001, boltTime + 0.25);
    boltOsc.connect(boltGain);
    boltGain.connect(input);
    boltOsc.start(boltTime);
    boltOsc.stop(boltTime + 0.3);
  }

  /**
   * Thompson Submachine Gun (.45 ACP burst)
   */
  public playThompson(burstCount: number = 6, distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;
    const interval = 0.085; // ~700 rpm

    for (let i = 0; i < burstCount; i++) {
      const time = now + i * interval;
      // Heavy low-pitch .45 thump
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.06);
      oscGain.gain.setValueAtTime(0.8, time);
      oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.07);

      // Noise pop
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.015));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.65, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.07);

      osc.connect(oscGain);
      oscGain.connect(input);
      noise.connect(noiseGain);
      noiseGain.connect(input);

      osc.start(time);
      noise.start(time);
      osc.stop(time + 0.08);
      noise.stop(time + 0.08);
    }
  }

  /**
   * Trench Mortar: Tube drop "thump", rising-falling launch whistle, crater explosion
   */
  public playMortar(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    // Tube "thump"
    const tubeOsc = ctx.createOscillator();
    const tubeGain = ctx.createGain();
    tubeOsc.type = 'sine';
    tubeOsc.frequency.setValueAtTime(80, now);
    tubeOsc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    tubeGain.gain.setValueAtTime(1.0, now);
    tubeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    tubeOsc.connect(tubeGain);
    tubeGain.connect(input);
    tubeOsc.start(now);
    tubeOsc.stop(now + 0.25);

    // Whistling trajectory (flight sound)
    const whistle = ctx.createOscillator();
    const whistleGain = ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(1200, now + 0.2);
    whistle.frequency.exponentialRampToValueAtTime(2600, now + 0.9);
    whistle.frequency.exponentialRampToValueAtTime(800, now + 1.6);

    whistleGain.gain.setValueAtTime(0.001, now + 0.2);
    whistleGain.gain.linearRampToValueAtTime(0.2, now + 0.9);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    whistle.connect(whistleGain);
    whistleGain.connect(input);
    whistle.start(now + 0.2);
    whistle.stop(now + 1.65);

    // Delayed impact blast at +1.6s
    setTimeout(() => {
      this.playArtilleryBlast(distance === 'near' ? 'mid' : 'far', pan);
    }, 1550);
  }

  // -------------------------------------------------------------
  // AIRPLANES (AVIÕES)
  // -------------------------------------------------------------

  /**
   * Junkers Ju 87 "Stuka": Jericho Trumpet diving siren + roaring radial engine + bomb drop
   */
  public playStukaDive(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;
    const duration = 4.2;

    // The Jericho Trumpet Siren: Screaming aerodynamic propeller sirens
    const siren1 = ctx.createOscillator();
    const siren2 = ctx.createOscillator();
    const sirenGain = ctx.createGain();

    siren1.type = 'sawtooth';
    siren2.type = 'triangle';

    // Pitch rises terrifically as airspeed accelerates in the dive, then peaks and falls
    siren1.frequency.setValueAtTime(450, now);
    siren1.frequency.exponentialRampToValueAtTime(1450, now + 2.8);
    siren1.frequency.exponentialRampToValueAtTime(320, now + duration);

    siren2.frequency.setValueAtTime(460, now);
    siren2.frequency.exponentialRampToValueAtTime(1480, now + 2.8);
    siren2.frequency.exponentialRampToValueAtTime(330, now + duration);

    // Volume swells
    sirenGain.gain.setValueAtTime(0.01, now);
    sirenGain.gain.exponentialRampToValueAtTime(0.45, now + 2.6);
    sirenGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(1600, now + 2.8);
    filter.Q.setValueAtTime(2.5, now);

    siren1.connect(filter);
    siren2.connect(filter);
    filter.connect(sirenGain);
    sirenGain.connect(input);

    // Engine roar (Jumo 211 inverted V-12)
    const engineOsc = ctx.createOscillator();
    const engineGain = ctx.createGain();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.setValueAtTime(95, now);
    engineOsc.frequency.linearRampToValueAtTime(210, now + 2.8);
    engineOsc.frequency.linearRampToValueAtTime(120, now + duration);

    engineGain.gain.setValueAtTime(0.05, now);
    engineGain.gain.linearRampToValueAtTime(0.35, now + 2.7);
    engineGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    const engineFilter = ctx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.setValueAtTime(450, now);

    engineOsc.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(input);

    siren1.start(now);
    siren2.start(now);
    engineOsc.start(now);

    siren1.stop(now + duration);
    siren2.stop(now + duration);
    engineOsc.stop(now + duration);

    // At dive pull-up (2.9s), bomb detonation impact!
    setTimeout(() => {
      this.playArtilleryBlast('near', pan);
    }, 2850);
  }

  /**
   * Supermarine Spitfire: Rolls-Royce Merlin engine hum and twin wing strafing run
   */
  public playSpitfire(panFrom: number = -1, panTo: number = 1) {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = 3.5;

    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (panner) {
      panner.pan.setValueAtTime(panFrom, now);
      panner.pan.linearRampToValueAtTime(panTo, now + duration);
      panner.connect(this.masterGain);
    }

    const dest = panner || this.masterGain;

    // Merlin V12 engine hum
    const engine1 = ctx.createOscillator();
    const engine2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    engine1.type = 'sawtooth';
    engine2.type = 'sine';

    // Doppler pitch shift
    engine1.frequency.setValueAtTime(180, now);
    engine1.frequency.exponentialRampToValueAtTime(240, now + 1.4);
    engine1.frequency.exponentialRampToValueAtTime(130, now + duration);

    engine2.frequency.setValueAtTime(90, now);
    engine2.frequency.exponentialRampToValueAtTime(120, now + 1.4);
    engine2.frequency.exponentialRampToValueAtTime(65, now + duration);

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.exponentialRampToValueAtTime(0.5, now + 1.4);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    engine1.connect(filter);
    engine2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(dest);

    engine1.start(now);
    engine2.start(now);
    engine1.stop(now + duration);
    engine2.stop(now + duration);

    // Twin machine gun strafing pass in the middle (1.2s to 2.0s)
    setTimeout(() => {
      this.playBrowningBurst();
    }, 1200);
  }

  private playBrowningBurst() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    for (let i = 0; i < 14; i++) {
      const time = now + i * 0.055;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.007));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

      noise.connect(gain);
      gain.connect(this.masterGain);
      noise.start(time);
      noise.stop(time + 0.055);
    }
  }

  /**
   * B-17 Flying Fortress Formation: Deep multi-engine drone & falling bombs
   */
  public playB17Formation() {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = 5.0;

    // Multiple beating low oscillators to simulate synchronized heavy radial engines
    const freqs = [78, 80.5, 82, 85];
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 2.5);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(280, now);
      osc.connect(f);
      f.connect(gain);
      osc.start(now);
      osc.stop(now + duration);
    });

    gain.connect(this.masterGain);

    // Falling bomb whistle in sequence
    setTimeout(() => {
      this.playBombDropWhistle();
    }, 1800);
    setTimeout(() => {
      this.playArtilleryBlast('far', -0.3);
    }, 3200);
    setTimeout(() => {
      this.playArtilleryBlast('mid', 0.4);
    }, 3800);
  }

  private playBombDropWhistle() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const whistle = ctx.createOscillator();
    const gain = ctx.createGain();

    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(3200, now);
    whistle.frequency.exponentialRampToValueAtTime(700, now + 1.4);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    whistle.connect(gain);
    gain.connect(this.masterGain);
    whistle.start(now);
    whistle.stop(now + 1.45);
  }

  // -------------------------------------------------------------
  // TANKS & ARMORED (TANQUES E BLINDADOS)
  // -------------------------------------------------------------

  /**
   * Tiger I: Heavy Maybach diesel idle/rev, squeaking metal caterpillar tracks, 88mm KwK 36 cannon
   */
  public playTigerI(fireCannon: boolean = true, distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;
    const duration = fireCannon ? 3.5 : 2.5;

    // Heavy Maybach V-12 rumble
    const engineOsc = ctx.createOscillator();
    const engineGain = ctx.createGain();
    engineOsc.type = 'sawtooth';
    engineOsc.frequency.setValueAtTime(45, now);
    engineOsc.frequency.linearRampToValueAtTime(68, now + 1.2);
    engineOsc.frequency.linearRampToValueAtTime(50, now + duration);

    engineGain.gain.setValueAtTime(0.1, now);
    engineGain.gain.linearRampToValueAtTime(0.55, now + 0.8);
    engineGain.gain.exponentialRampToValueAtTime(0.02, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, now);

    engineOsc.connect(filter);
    filter.connect(engineGain);
    engineGain.connect(input);
    engineOsc.start(now);
    engineOsc.stop(now + duration);

    // Track squeak (metal friction)
    for (let i = 0; i < 4; i++) {
      const squeakTime = now + 0.2 + i * 0.45;
      const squeak = ctx.createOscillator();
      const squeakGain = ctx.createGain();
      squeak.type = 'sine';
      squeak.frequency.setValueAtTime(1400 + Math.random() * 400, squeakTime);
      squeak.frequency.exponentialRampToValueAtTime(800, squeakTime + 0.15);
      squeakGain.gain.setValueAtTime(0.12, squeakTime);
      squeakGain.gain.exponentialRampToValueAtTime(0.001, squeakTime + 0.16);

      squeak.connect(squeakGain);
      squeakGain.connect(input);
      squeak.start(squeakTime);
      squeak.stop(squeakTime + 0.2);
    }

    // 88mm KwK 36 Cannon blast!
    if (fireCannon) {
      setTimeout(() => {
        this.play88mmCannon(distance, pan);
      }, 900);
    }
  }

  /**
   * 88mm KwK 36 Tank Cannon Blast
   */
  public play88mmCannon(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    // Sub-bass shockwave
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(90, now);
    sub.frequency.exponentialRampToValueAtTime(20, now + 0.6);
    subGain.gain.setValueAtTime(1.4, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    // Explosive high pressure crack
    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    sub.connect(subGain);
    subGain.connect(input);
    noise.connect(noiseGain);
    noiseGain.connect(input);

    sub.start(now);
    noise.start(now);
    sub.stop(now + 0.75);
    noise.stop(now + 0.85);
  }

  /**
   * T-34/76: Rugged Soviet V-2 diesel engine clatter + 76mm shot
   */
  public playT34(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    // Rapid mechanical diesel clatter
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(55, now);
    oscGain.gain.setValueAtTime(0.25, now);
    oscGain.gain.linearRampToValueAtTime(0.01, now + 2.0);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(input);
    osc.start(now);
    osc.stop(now + 2.0);

    setTimeout(() => {
      this.play88mmCannon(distance, pan);
    }, 600);
  }

  /**
   * M4 Sherman: Continental Radial engine vibration and 75mm gun
   */
  public playSherman(distance: 'near' | 'mid' | 'far' = 'near', pan: number = 0) {
    const voice = this.createVoice(distance, pan);
    if (!voice) return;
    const { ctx, input } = voice;
    const now = ctx.currentTime;

    // Radial engine hum
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65, now);
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 2.2);

    osc.connect(oscGain);
    oscGain.connect(input);
    osc.start(now);
    osc.stop(now + 2.2);

    setTimeout(() => {
      this.play88mmCannon(distance, pan);
    }, 500);
  }

  // -------------------------------------------------------------
  // EXPLOSIONS & ARTILLERY (EXPLOSÕES & ARTILHARIA)
  // -------------------------------------------------------------

  /**
   * Katyusha "Stalin's Organ" (BM-13): Screaming banshee rocket launches in salvo
   */
  public playKatyushaSalvo(salvoCount: number = 8, pan: number = -0.5) {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    for (let i = 0; i < salvoCount; i++) {
      const time = now + i * 0.18;
      // High-pitched screaming banshee rocket whoosh
      const whistle = ctx.createOscillator();
      const whistleGain = ctx.createGain();
      whistle.type = 'sawtooth';
      whistle.frequency.setValueAtTime(800 + Math.random() * 200, time);
      whistle.frequency.exponentialRampToValueAtTime(2200 + Math.random() * 300, time + 0.45);
      whistle.frequency.exponentialRampToValueAtTime(450, time + 0.9);

      whistleGain.gain.setValueAtTime(0.01, time);
      whistleGain.gain.linearRampToValueAtTime(0.3, time + 0.3);
      whistleGain.gain.exponentialRampToValueAtTime(0.01, time + 0.9);

      // Rocket propellant hiss
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * (1 - j / data.length);
      }
      const hiss = ctx.createBufferSource();
      hiss.buffer = buffer;
      const hissGain = ctx.createGain();
      hissGain.gain.setValueAtTime(0.3, time);
      hissGain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);

      whistle.connect(whistleGain);
      whistleGain.connect(this.masterGain);
      hiss.connect(hissGain);
      hissGain.connect(this.masterGain);

      whistle.start(time);
      hiss.start(time);
      whistle.stop(time + 0.95);
      hiss.stop(time + 0.85);
    }

    // Delayed crater explosions on the horizon
    setTimeout(() => {
      for (let k = 0; k < 4; k++) {
        setTimeout(() => {
          this.playArtilleryBlast('far', pan + (Math.random() * 0.4 - 0.2));
        }, k * 260);
      }
    }, 1200);
  }

  /**
   * 105mm Howitzer / Heavy Artillery Shell Impact
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
      shriek.frequency.setValueAtTime(1800, now);
      shriek.frequency.exponentialRampToValueAtTime(600, now + 0.18);
      shriekGain.gain.setValueAtTime(0.2, now);
      shriekGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      shriek.connect(shriekGain);
      shriekGain.connect(input);
      shriek.start(now);
      shriek.stop(now + 0.2);
    }

    const blastTime = now + (distance === 'near' ? 0.12 : 0);

    // Deep sub-bass crater rumble
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(75, blastTime);
    sub.frequency.exponentialRampToValueAtTime(18, blastTime + 1.2);
    subGain.gain.setValueAtTime(1.5, blastTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, blastTime + 1.3);

    // Heavy dirt & explosive expansion noise
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.18));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(distance === 'near' ? 2400 : 800, blastTime);
    filter.frequency.exponentialRampToValueAtTime(160, blastTime + 1.2);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1.3, blastTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, blastTime + 1.4);

    sub.connect(subGain);
    subGain.connect(input);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(input);

    sub.start(blastTime);
    noise.start(blastTime);
    sub.stop(blastTime + 1.35);
    noise.stop(blastTime + 1.5);
  }

  /**
   * Naval Bombardment (16-inch guns offshore)
   */
  public playNavalBombardment() {
    if (!this.ensureRunning() || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Colossal reverberating sub-bass
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(45, now);
    sub.frequency.exponentialRampToValueAtTime(15, now + 2.5);
    subGain.gain.setValueAtTime(1.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 2.85);

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

    // Pin spoon snap
    const pin = ctx.createOscillator();
    const pinGain = ctx.createGain();
    pin.type = 'triangle';
    pin.frequency.setValueAtTime(2100, now);
    pinGain.gain.setValueAtTime(0.3, now);
    pinGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    pin.connect(pinGain);
    pinGain.connect(input);
    pin.start(now);
    pin.stop(now + 0.1);

    // Fuse hiss
    const fuseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.9, ctx.sampleRate);
    const fuseData = fuseBuffer.getChannelData(0);
    for (let i = 0; i < fuseData.length; i++) {
      fuseData[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const fuseNoise = ctx.createBufferSource();
    fuseNoise.buffer = fuseBuffer;
    const fuseGain = ctx.createGain();
    fuseGain.gain.setValueAtTime(0.12, now);
    fuseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    fuseNoise.connect(fuseGain);
    fuseGain.connect(input);
    fuseNoise.start(now);
    fuseNoise.stop(now + 0.95);

    // Sharp shrapnel blast at 1.0s
    setTimeout(() => {
      this.playArtilleryBlast(distance, pan);
    }, 950);
  }

  // -------------------------------------------------------------
  // CONTINUOUS TRENCH AMBIENCE (AMBIENTE CONTÍNUO DA TRINCHEIRA)
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
      filter.frequency.setValueAtTime(1100, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.rainGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 1.0);

      noise.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(this.masterGain);
      noise.start();
      this.rainNode = noise;
    } else {
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
      filter.frequency.setValueAtTime(260, this.ctx.currentTime);

      // Low frequency modulation for howling wind gusts
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.windGain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 1.2);

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

        // Next boom randomly in 2 to 6 seconds
        const nextDelay = 2200 + Math.random() * 4500;
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
      // High-pitched crackle + Morse code beeps
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
      filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      this.radioGain = this.ctx.createGain();
      this.radioGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.radioGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.6);

      noise.connect(filter);
      filter.connect(this.radioGain);
      this.radioGain.connect(this.masterGain);
      noise.start();
      this.radioNode = noise;

      // Periodic morse code beeps
      const triggerMorse = () => {
        if (!this.ambientState.radio || !this.ctx || !this.masterGain) return;
        const morseTime = this.ctx.currentTime;
        const beeps = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < beeps; i++) {
          const t = morseTime + i * 0.14;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(750, t);
          g.gain.setValueAtTime(0.08, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.09);
        }
        if (this.ambientState.radio) {
          setTimeout(triggerMorse, 3500 + Math.random() * 5000);
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
