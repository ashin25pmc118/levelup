// Web Audio API Synthesizer for RPG Sound Effects (Zero External Asset Dependencies)

class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.5;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setSettings(enabled: boolean, vol: number) {
    this.soundEnabled = enabled;
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public playClick() {
    if (!this.soundEnabled || this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playQuestComplete() {
    if (!this.soundEnabled || this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Note 1: E5 (659.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(this.volume * 0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Note 2: B5 (987.77Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.1);
      gain2.gain.setValueAtTime(this.volume * 0.35, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.35);
    } catch {
      // Audio fallback
    }
  }

  public playLevelUp() {
    if (!this.soundEnabled || this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.12 }, // C5
        { freq: 659.25, time: 0.12, dur: 0.12 }, // E5
        { freq: 783.99, time: 0.24, dur: 0.15 }, // G5
        { freq: 1046.50, time: 0.38, dur: 0.60 } // C6
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);
        gain.gain.setValueAtTime(this.volume * 0.35, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch {
      // Audio fallback
    }
  }

  public playTimerDone() {
    if (!this.soundEnabled || this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Gentle meditation bowl bell sound
      const freqs = [528, 1056]; // 528Hz Solfeggio / Clarity tone
      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(this.volume * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.25);
      });
    } catch {
      // Fallback
    }
  }

  public playReflexBeep(highPitch: boolean = false) {
    if (!this.soundEnabled || this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(highPitch ? 1200 : 440, ctx.currentTime);
      gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Fallback
    }
  }

  public playTick() {
    if (!this.soundEnabled || this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      gain.gain.setValueAtTime(this.volume * 0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // Fallback
    }
  }

  public playCueBeep(freq: number = 880) {
    if (!this.soundEnabled || this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Fallback
    }
  }

  // ===============================
  // MULTI-TRACK AMBIENT MIXER (Zero External MP3 Assets)
  // Simultaneous 4-Channel Synthesizer: Rain, Campfire, Cafe, 40Hz Gamma Beats
  // ===============================
  private mixerActive: boolean = false;
  private mixerVolumes = {
    rain: 0,
    campfire: 0,
    cafe: 0,
    gamma: 0
  };
  private trackNodes: {
    rain?: { source: AudioNode; gain: GainNode };
    campfire?: { source: AudioNode; crackleTimer?: any; gain: GainNode };
    cafe?: { source: AudioNode; gain: GainNode };
    gamma?: { oscL: OscillatorNode; oscR: OscillatorNode; gain: GainNode };
  } = {};
  private mixerMasterGain: GainNode | null = null;

  public getMixerVolumes() {
    return { ...this.mixerVolumes };
  }

  public isMixerActive() {
    return this.mixerActive;
  }

  public startMixer(initialVolumes?: Partial<{ rain: number; campfire: number; cafe: number; gamma: number }>) {
    if (initialVolumes) {
      if (initialVolumes.rain !== undefined) this.mixerVolumes.rain = Math.max(0, Math.min(1, initialVolumes.rain));
      if (initialVolumes.campfire !== undefined) this.mixerVolumes.campfire = Math.max(0, Math.min(1, initialVolumes.campfire));
      if (initialVolumes.cafe !== undefined) this.mixerVolumes.cafe = Math.max(0, Math.min(1, initialVolumes.cafe));
      if (initialVolumes.gamma !== undefined) this.mixerVolumes.gamma = Math.max(0, Math.min(1, initialVolumes.gamma));
    }

    const ctx = this.getContext();
    if (!ctx) return;

    if (!this.mixerMasterGain) {
      this.mixerMasterGain = ctx.createGain();
      this.mixerMasterGain.gain.setValueAtTime(1, ctx.currentTime);
      this.mixerMasterGain.connect(ctx.destination);
    }

    this.mixerActive = true;

    // Start each track if volume > 0 and not yet created
    this.updateTrack('rain');
    this.updateTrack('campfire');
    this.updateTrack('cafe');
    this.updateTrack('gamma');
  }

  public setMixerTrackVolume(track: 'rain' | 'campfire' | 'cafe' | 'gamma', vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.mixerVolumes[track] = clamped;

    if (!this.mixerActive && clamped > 0) {
      this.startMixer();
      return;
    }

    if (this.mixerActive) {
      this.updateTrack(track);
    }
  }

  private updateTrack(track: 'rain' | 'campfire' | 'cafe' | 'gamma') {
    const ctx = this.getContext();
    if (!ctx || !this.mixerMasterGain) return;
    const vol = this.mixerVolumes[track];

    if (vol <= 0) {
      // Fade out and stop track
      const existing = this.trackNodes[track];
      if (existing) {
        try {
          existing.gain.gain.setValueAtTime(existing.gain.gain.value, ctx.currentTime);
          existing.gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
          setTimeout(() => {
            if (this.mixerVolumes[track] <= 0) {
              this.stopTrackNode(track);
            }
          }, 350);
        } catch {}
      }
      return;
    }

    // If track already exists, smoothly update volume
    if (this.trackNodes[track]) {
      const g = this.trackNodes[track]?.gain;
      if (g) {
        g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
        g.gain.linearRampToValueAtTime(vol * 0.45, ctx.currentTime + 0.1);
      }
      return;
    }

    // Otherwise instantiate track synthesizer
    try {
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol * 0.45, ctx.currentTime + 0.2);
      gain.connect(this.mixerMasterGain);

      if (track === 'rain') {
        // Continuous rain with bandpass filter
        const bufferSize = ctx.sampleRate * 3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.4;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(900, ctx.currentTime);
        filter.Q.setValueAtTime(0.7, ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        noise.start();

        this.trackNodes.rain = { source: noise, gain };
      } else if (track === 'campfire') {
        // Warm brown rumble + crackle generator
        const bufferSize = ctx.sampleRate * 3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 2.8;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(320, ctx.currentTime);

        noise.connect(lowpass);
        lowpass.connect(gain);
        noise.start();

        // Sporadic crackle bursts
        const crackleTimer = setInterval(() => {
          if (!this.mixerActive || this.mixerVolumes.campfire <= 0) return;
          if (Math.random() < 0.6) {
            try {
              const snap = ctx.createBufferSource();
              const snapBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.02), ctx.sampleRate);
              const snapData = snapBuf.getChannelData(0);
              for (let j = 0; j < snapBuf.length; j++) {
                snapData[j] = (Math.random() * 2 - 1) * (1 - j / snapBuf.length);
              }
              snap.buffer = snapBuf;
              const snapGain = ctx.createGain();
              snapGain.gain.setValueAtTime(this.mixerVolumes.campfire * 0.25 * (0.4 + Math.random() * 0.6), ctx.currentTime);
              snap.connect(snapGain);
              snapGain.connect(gain);
              snap.start();
            } catch {}
          }
        }, 180);

        this.trackNodes.campfire = { source: noise, crackleTimer, gain };
      } else if (track === 'cafe') {
        // Cafe murmur: warm pinkish mid-tones
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2) * 0.45;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const band = ctx.createBiquadFilter();
        band.type = 'bandpass';
        band.frequency.setValueAtTime(550, ctx.currentTime);
        band.Q.setValueAtTime(0.9, ctx.currentTime);

        noise.connect(band);
        band.connect(gain);
        noise.start();

        this.trackNodes.cafe = { source: noise, gain };
      } else if (track === 'gamma') {
        // 40Hz Gamma Binaural Beat (Left: 200Hz, Right: 240Hz)
        const merger = ctx.createChannelMerger(2);

        const oscL = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(200, ctx.currentTime);
        const gL = ctx.createGain();
        gL.gain.setValueAtTime(0.3, ctx.currentTime);
        oscL.connect(gL);
        gL.connect(merger, 0, 0);

        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(240, ctx.currentTime);
        const gR = ctx.createGain();
        gR.gain.setValueAtTime(0.3, ctx.currentTime);
        oscR.connect(gR);
        gR.connect(merger, 0, 1);

        merger.connect(gain);
        oscL.start();
        oscR.start();

        this.trackNodes.gamma = { oscL, oscR, gain };
      }
    } catch {}
  }

  private stopTrackNode(track: 'rain' | 'campfire' | 'cafe' | 'gamma') {
    const node = this.trackNodes[track];
    if (!node) return;
    try {
      if (track === 'gamma') {
        const gNode = node as { oscL: OscillatorNode; oscR: OscillatorNode; gain: GainNode };
        gNode.oscL?.stop();
        gNode.oscR?.stop();
      } else {
        const sNode = node as { source: any; crackleTimer?: any; gain: GainNode };
        sNode.source?.stop?.();
        if (sNode.crackleTimer) clearInterval(sNode.crackleTimer);
      }
    } catch {}
    delete this.trackNodes[track];
  }

  public stopMixer() {
    this.mixerActive = false;
    (['rain', 'campfire', 'cafe', 'gamma'] as const).forEach(track => {
      this.stopTrackNode(track);
    });
  }

  // Backwards compatibility for single-ambient calls
  public startAmbient(type: 'brown' | 'binaural' | 'rain', volume: number = 0.3) {
    if (type === 'rain') {
      this.startMixer({ rain: volume, campfire: 0, cafe: 0, gamma: 0 });
    } else if (type === 'binaural') {
      this.startMixer({ rain: 0, campfire: 0, cafe: 0, gamma: volume });
    } else if (type === 'brown') {
      this.startMixer({ rain: 0, campfire: volume, cafe: 0, gamma: 0 });
    }
  }

  public stopAmbient() {
    this.stopMixer();
  }

  public isAmbientPlaying() {
    return this.mixerActive && Object.values(this.mixerVolumes).some(v => v > 0);
  }

  public playWaterDrop() {
    if (!this.soundEnabled || this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Realistic liquid droplet pitch contour (quick rise and tail)
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio fallback
    }
  }

  public playHabitCheck() {
    if (!this.soundEnabled || this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Note 1: Clean high bell (784Hz - G5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(784, now);
      gain1.gain.setValueAtTime(this.volume * 0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // Note 2: Harmonic chime (1174.6Hz - D6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.6, now + 0.07);
      gain2.gain.setValueAtTime(this.volume * 0.3, now + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.07);
      osc2.stop(now + 0.35);
    } catch {
      // Audio fallback
    }
  }

  public initAudio() {
    this.getContext();
  }
}

export const sounds = new SoundEngine();

if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    sounds.initAudio();
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
}
