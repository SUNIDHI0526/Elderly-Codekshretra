// High-volume Emergency Siren Audio Generator using Web Audio API
class EmergencyAudioService {
  private audioCtx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: any = null;
  private isPlaying: boolean = false;
  private volume: number = 1.0; // Max volume by default per request

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playEmergencySiren(durationMs: number = 10000) {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      this.stopEmergencySiren();

      const now = this.audioCtx.currentTime;
      this.gainNode = this.audioCtx.createGain();
      // Set to maximum clean audible volume (1.0)
      this.gainNode.gain.setValueAtTime(this.volume, now);
      this.gainNode.connect(this.audioCtx.destination);

      this.osc1 = this.audioCtx.createOscillator();
      this.osc1.type = 'sawtooth';
      this.osc1.frequency.setValueAtTime(960, now); // High European/Indian ambulance emergency alert frequency

      this.osc2 = this.audioCtx.createOscillator();
      this.osc2.type = 'square';
      this.osc2.frequency.setValueAtTime(770, now);

      this.osc1.connect(this.gainNode);
      this.osc2.connect(this.gainNode);

      this.osc1.start(now);
      this.osc2.start(now);
      this.isPlaying = true;

      // Alternating warble siren pulse for emergency attention
      let toggle = false;
      this.intervalId = setInterval(() => {
        if (!this.audioCtx || !this.osc1 || !this.osc2) return;
        const t = this.audioCtx.currentTime;
        toggle = !toggle;
        this.osc1.frequency.setValueAtTime(toggle ? 960 : 770, t);
        this.osc2.frequency.setValueAtTime(toggle ? 770 : 960, t);
      }, 350);

      // Automatically stop after duration
      if (durationMs > 0) {
        setTimeout(() => {
          this.stopEmergencySiren();
        }, durationMs);
      }
    } catch (err) {
      console.warn('Web Audio Siren error:', err);
    }
  }

  public stopEmergencySiren() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.osc1) {
      try {
        this.osc1.stop();
        this.osc1.disconnect();
      } catch (e) {}
      this.osc1 = null;
    }
    if (this.osc2) {
      try {
        this.osc2.stop();
        this.osc2.disconnect();
      } catch (e) {}
      this.osc2 = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch (e) {}
      this.gainNode = null;
    }
    this.isPlaying = false;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1.0, vol));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const emergencyAudio = new EmergencyAudioService();
