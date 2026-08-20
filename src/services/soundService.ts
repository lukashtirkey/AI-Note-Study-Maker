export class SoundService {
  private audioCtx: AudioContext | null = null;
  private activeNodes: Map<string, { gainNode: GainNode; stop: () => void }> = new Map();

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public toggleSound(soundType: string, volume: number = 0.5): boolean {
    if (this.activeNodes.has(soundType)) {
      this.stopSound(soundType);
      return false;
    } else {
      this.playSound(soundType, volume);
      return true;
    }
  }

  public playSound(soundType: string, volume: number = 0.5) {
    this.stopSound(soundType);
    const ctx = this.getContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);

    let stopFn: () => void = () => {};

    if (soundType === 'rain') {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();

      stopFn = () => {
        try { whiteNoise.stop(); } catch {}
      };
    } else if (soundType === 'space' || soundType === 'lofi') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(5, ctx.currentTime);

      lfo.connect(osc.frequency);
      osc.connect(masterGain);

      osc.start();
      lfo.start();

      stopFn = () => {
        try { osc.stop(); lfo.stop(); } catch {}
      };
    } else if (soundType === 'forest') {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }
      const pinkNoise = ctx.createBufferSource();
      pinkNoise.buffer = noiseBuffer;
      pinkNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.Q.setValueAtTime(1.0, ctx.currentTime);

      pinkNoise.connect(filter);
      filter.connect(masterGain);
      pinkNoise.start();

      stopFn = () => {
        try { pinkNoise.stop(); } catch {}
      };
    } else if (soundType === 'coffee') {
      // Warm low-passed chatter noise simulation
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(2.5, ctx.currentTime);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();

      stopFn = () => {
        try { noise.stop(); } catch {}
      };
    } else if (soundType === 'waves') {
      // Slow ocean wave amplitude modulation
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // 10s wave cycle
      const waveGain = ctx.createGain();
      waveGain.gain.setValueAtTime(0.3, ctx.currentTime);

      lfo.connect(waveGain.gain);
      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      lfo.start();

      stopFn = () => {
        try { noise.stop(); lfo.stop(); } catch {}
      };
    }

    this.activeNodes.set(soundType, { gainNode: masterGain, stop: stopFn });
  }

  public setVolume(soundType: string, volume: number) {
    const node = this.activeNodes.get(soundType);
    if (node && this.audioCtx) {
      node.gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    }
  }

  public stopSound(soundType: string) {
    const node = this.activeNodes.get(soundType);
    if (node) {
      node.stop();
      this.activeNodes.delete(soundType);
    }
  }

  public stopAll() {
    this.activeNodes.forEach((node) => node.stop());
    this.activeNodes.clear();
  }

  /**
   * Audibly speaks "Welcome to AI Note-Study Maker" using Web Speech API
   */
  public speakWelcomeGreeting(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('Welcome to AI Note-Study Maker');
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis unavailable:', err);
      }
    }
  }
}

export const soundService = new SoundService();
