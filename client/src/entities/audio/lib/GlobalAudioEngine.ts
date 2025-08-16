// WebAudioFont（シンセ）と、ループBGM（<audio>）の両方を管理する永続エンジン。
// 画面遷移してもインスタンスが破棄されないよう、シングルトンで提供。

declare const _tone_0000_Aspirin_sf2_file: any;

export class GlobalAudioEngine {
  private static _instance: GlobalAudioEngine | null = null;
  static get instance() {
    if (!this._instance) this._instance = new GlobalAudioEngine();
    return this._instance;
  }

  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private wafPlayer: any | null = null;
  private wafLoaded = false;

  private loopEl: HTMLAudioElement | null = null;
  private loopSrc: MediaElementAudioSourceNode | null = null;
  private loopGain: GainNode | null = null;

  private constructor() {}

  async ensureStarted() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  async initWebAudioFont() {
    await this.ensureStarted();
    if (!this.ctx || this.wafPlayer) return;
    this.wafPlayer = new (window as any).WebAudioFontPlayer();
    if (_tone_0000_Aspirin_sf2_file?.url) {
      this.wafPlayer.loader.startLoad(this.ctx, _tone_0000_Aspirin_sf2_file.url);
      this.wafPlayer.loader.waitLoad(() => { this.wafLoaded = true; });
    } else {
      this.wafPlayer.loader.decodeAfterLoading(this.ctx, _tone_0000_Aspirin_sf2_file);
      this.wafLoaded = true;
    }
  }

  noteOn(midi: number, velocity = 127, durationSec?: number) {
    if (!this.ctx || !this.wafPlayer || !this.wafLoaded) return null;
    const when = this.ctx.currentTime;
    const v = this.wafPlayer.queueWaveTable(
      this.ctx,
      this.masterGain,
      _tone_0000_Aspirin_sf2_file,
      when,
      midi,
      durationSec ?? 999,
      velocity / 127,
    );
    return v;
  }

  noteOff(voiceHandle: any) {
    if (!this.wafPlayer || !voiceHandle) return;
    try {
      this.wafPlayer.cancelQueue(this.ctx, this.masterGain);
    } catch {}
  }

  async loadLoop(url: string, { loop = true, volume = 1 }: { loop?: boolean; volume?: number } = {}) {
    await this.ensureStarted();
    if (!this.ctx || !this.masterGain) return;
    if (!this.loopEl) {
      this.loopEl = new Audio();
      this.loopEl.crossOrigin = 'anonymous';
      this.loopEl.loop = loop;
      this.loopEl.preload = 'auto';
    }
    if (this.loopEl.src !== url) {
      this.loopEl.src = url;
      await new Promise<void>((resolve) => {
        const onReady = () => { this.loopEl?.removeEventListener('canplay', onReady); resolve(); };
        this.loopEl!.addEventListener('canplay', onReady);
        this.loopEl!.load();
      });
    } else {
      this.loopEl.loop = loop;
    }
    if (!this.loopSrc) {
      this.loopSrc = this.ctx.createMediaElementSource(this.loopEl);
      this.loopGain = this.ctx.createGain();
      this.loopGain.gain.value = volume;
      this.loopSrc.connect(this.loopGain);
      this.loopGain.connect(this.masterGain);
    } else if (this.loopGain) {
      this.loopGain.gain.value = volume;
    }
  }

  playLoop() { this.loopEl?.play(); }
  pauseLoop() { this.loopEl?.pause(); }
  setLoopVolume(v: number) { if (this.loopGain) this.loopGain.gain.value = v; }
  isLoopPlaying() { return !!this.loopEl && !this.loopEl.paused; }
  setMasterVolume(v: number) { if (this.masterGain) this.masterGain.gain.value = v; }
  get audioContext() { return this.ctx; }
  get player() { return this.wafPlayer; }
}
