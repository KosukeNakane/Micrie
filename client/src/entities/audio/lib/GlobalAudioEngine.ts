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
  private masterGain: GainNode | null = null; // 合流点（プリ・エフェクト）
  private outputGain: GainNode | null = null; // 最終出力（ポスト・エフェクト）

  private wafPlayer: any | null = null;
  private wafLoaded = false;

  private loopEl: HTMLAudioElement | null = null;
  private loopSrc: MediaElementAudioSourceNode | null = null;
  private loopGain: GainNode | null = null;

  // Reverb chain (マスター適用): masterGain -> [dryGain -> outputGain] + [convolver -> wetGain -> outputGain]
  private reverbEnabled = false;
  private convolver: ConvolverNode | null = null;
  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private reverbWet = 0; // 0..1

  private constructor() {
    // シングルトン実装のための空コンストラクタ。
    // 外部からの new を禁止し、`instance` 経由でのみ生成・参照させる意図で空実装としている。
  }

  async ensureStarted() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1; // プリ段
      this.outputGain = this.ctx.createGain();
      this.outputGain.gain.value = 1; // マスター音量
      // 初期はドライ直結
      this.masterGain.connect(this.outputGain);
      this.outputGain.connect(this.ctx.destination);
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
      // WebAudioFont のキューを masterGain（全体出力）に対して一括キャンセルする。
      this.wafPlayer.cancelQueue(this.ctx, this.masterGain);
    } catch (e) {
      // UI/UX を中断させないための意図的な no-op。
    }
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
      this.ensureLoopConnected();
    } else if (this.loopGain) {
      this.loopGain.gain.value = volume;
      this.ensureLoopConnected();
    }
  }

  playLoop() { this.loopEl?.play(); }
  pauseLoop() { this.loopEl?.pause(); }
  setLoopVolume(v: number) { if (this.loopGain) this.loopGain.gain.value = v; }
  isLoopPlaying() { return !!this.loopEl && !this.loopEl.paused; }
  setMasterVolume(v: number) { if (this.outputGain) this.outputGain.gain.value = v; }
  get audioContext() { return this.ctx; }
  get player() { return this.wafPlayer; }
  get masterInput(): AudioNode | null { return this.masterGain; }

  async unlock() {
    await this.ensureStarted();
    if (!this.ctx || !this.masterGain) return;
    // クリックノイズ回避のため無音で短く鳴らしてグラフを起動させる
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    g.gain.value = 0; // 無音
    osc.connect(g).connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // --- Reverb (master) -------------------------------------------------
  private async ensureReverbNodes() {
    if (!this.ctx) return;
    if (this.convolver && this.wetGain && this.dryGain) return;
    // 生成
    this.convolver = this.ctx.createConvolver();
    this.convolver.normalize = true;
    this.wetGain = this.ctx.createGain();
    this.dryGain = this.ctx.createGain();
    // 初期wet/dry
    this.applyReverbWetGains();
    // IR を生成（外部ファイルは使用せず、即席IRを採用）
    try {
      const { loadImpulse } = await import("@/shared/lib/audio/loadImpulse");
      const ir = await loadImpulse(undefined, this.ctx);
      this.convolver.buffer = ir;
    } catch (_) {
      // フォールバックIRは loadImpulse 内で生成済みのためここでは no-op
    }
  }

  private applyReverbWetGains() {
    if (!this.wetGain || !this.dryGain) return;
    const wet = this.reverbWet;
    const dry = 1 - wet;
    this.wetGain.gain.value = wet;
    this.dryGain.gain.value = dry;
  }

  private ensureLoopConnected() {
    if (!this.masterGain || !this.loopGain) return;
    try { this.loopGain.disconnect(); } catch (_) { /* no-op */ }
    this.loopGain.connect(this.masterGain);
  }

  private connectMasterToOutput() {
    if (!this.masterGain || !this.outputGain) return;
    try { this.masterGain.disconnect(); } catch (_) { /* no-op */ }
    if (!this.reverbEnabled) {
      this.masterGain.connect(this.outputGain);
      return;
    }
    if (!this.convolver || !this.wetGain || !this.dryGain) return;
    try { this.dryGain.disconnect(); } catch (_) { /* no-op */ }
    try { this.wetGain.disconnect(); } catch (_) { /* no-op */ }
    this.masterGain.connect(this.dryGain);
    this.masterGain.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.dryGain.connect(this.outputGain);
    this.wetGain.connect(this.outputGain);
  }

  async setReverbEnabled(on: boolean) {
    await this.ensureStarted();
    if (on === this.reverbEnabled) return;
    this.reverbEnabled = on;
    if (this.reverbEnabled) {
      await this.ensureReverbNodes();
    }
    this.connectMasterToOutput();
  }

  async setReverbWet(value: number) {
    const v = Math.max(0, Math.min(1, value));
    this.reverbWet = v;
    await this.ensureStarted();
    if (this.reverbEnabled) {
      await this.ensureReverbNodes();
      this.applyReverbWetGains();
    }
  }

  // バッファをエンジンのマスターチェーン経由でワンショット再生
  playBufferSegment(buffer: AudioBuffer, startTime = 0, endTime?: number) {
    if (!this.ctx || !this.masterGain) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.masterGain);
    const dur = endTime != null ? Math.max(0, endTime - startTime) : undefined;
    try { src.start(0, startTime, dur); } catch (_) { /* no-op */ }
    return src;
  }
}
