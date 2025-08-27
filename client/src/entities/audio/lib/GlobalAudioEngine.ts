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
  private masterMuted = false;
  private prevOutputGain = 1;

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

  // Cut filters (master-wide): masterGain -> [lowcut] -> [hicut] -> (reverb/dry)
  private lowcutEnabled = false;
  private hicutEnabled = false;
  private lowcutAmount = 0; // 0..1 (0 = bypass)
  private hicutAmount = 0; // 0..1 (0 = bypass)
  private lowcutNode: BiquadFilterNode | null = null;
  private hicutNode: BiquadFilterNode | null = null;

  // DIRTY (distortion) — inserted after lowcut, before hicut
  private dirtyEnabled = false;
  private dirtyAmount = 0; // 0..1
  private dirtyPreGain: GainNode | null = null;
  private dirtyShaper: WaveShaperNode | null = null;
  private dirtyPostGain: GainNode | null = null;

  // CRUSH (bitcrusher) — inserted after lowcut and before DIRTY
  private bitcrusherEnabled = false;
  private bitcrusherAmount = 0; // 0..1
  private bitcrusherNode: AudioWorkletNode | null = null;

  // COMB (flanger/comb filter) — inserted after DIRTY, before hicut
  private combEnabled = false;
  private combAmount = 0; // 0..1
  private combIn: GainNode | null = null;
  private combDelay: DelayNode | null = null;
  private combFeedback: GainNode | null = null;
  private combWet: GainNode | null = null;
  private combDry: GainNode | null = null;
  private combOut: GainNode | null = null;
  private combLFO: OscillatorNode | null = null;
  private combLFOGain: GainNode | null = null;

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
      this.outputGain.gain.value = 1; // マスター音量（mute時は0に退避）
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

  // 即時ミュート/解除（現在鳴っている音も即サイレンス化）。
  async setMasterMuted(muted: boolean) {
    await this.ensureStarted();
    if (!this.ctx || !this.outputGain) return;
    if (muted === this.masterMuted) return;
    const now = this.ctx.currentTime;
    if (muted) {
      this.prevOutputGain = this.outputGain.gain.value;
      this.outputGain.gain.cancelScheduledValues(now);
      this.outputGain.gain.setTargetAtTime(0, now, 0.01);
      this.masterMuted = true;
    } else {
      const target = this.prevOutputGain > 0 ? this.prevOutputGain : 1;
      this.outputGain.gain.cancelScheduledValues(now);
      this.outputGain.gain.setTargetAtTime(target, now, 0.02);
      this.masterMuted = false;
    }
  }

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
    // いったん関係ノードを切断
    try { this.masterGain.disconnect(); } catch (_) { /* no-op */ }
    try { this.lowcutNode?.disconnect(); } catch (_) { /* no-op */ }
    try { this.bitcrusherNode?.disconnect(); } catch (_) { /* no-op */ }
    try { this.dirtyPreGain?.disconnect(); } catch (_) { /* no-op */ }
    try { this.dirtyShaper?.disconnect(); } catch (_) { /* no-op */ }
    try { this.dirtyPostGain?.disconnect(); } catch (_) { /* no-op */ }
    try { this.hicutNode?.disconnect(); } catch (_) { /* no-op */ }
    // comb nodes
    try { this.combIn?.disconnect(); } catch (_) { /* no-op */ }
    try { this.combDelay?.disconnect(); } catch (_) { /* no-op */ }
    try { this.combFeedback?.disconnect(); } catch (_) { /* no-op */ }
    try { this.combWet?.disconnect(); } catch (_) { /* no-op */ }
    try { this.combDry?.disconnect(); } catch (_) { /* no-op */ }
    try { this.combOut?.disconnect(); } catch (_) { /* no-op */ }
    try { this.dryGain?.disconnect(); } catch (_) { /* no-op */ }
    try { this.wetGain?.disconnect(); } catch (_) { /* no-op */ }

    // フィルタチェーンを構成
    let tail: AudioNode = this.masterGain;
    if (this.lowcutEnabled && this.lowcutNode) {
      tail.connect(this.lowcutNode);
      tail = this.lowcutNode;
    }
    // optional bitcrusher (CRUSH)
    if (this.bitcrusherEnabled && this.bitcrusherNode) {
      tail.connect(this.bitcrusherNode);
      tail = this.bitcrusherNode;
    }
    // optional DIRTY (waveshaper)
    if (this.dirtyEnabled && this.dirtyPreGain && this.dirtyShaper && this.dirtyPostGain) {
      tail.connect(this.dirtyPreGain);
      this.dirtyPreGain.connect(this.dirtyShaper);
      this.dirtyShaper.connect(this.dirtyPostGain);
      tail = this.dirtyPostGain;
    }
    // optional COMB (flanger-like)
    if (this.combEnabled && this.combIn && this.combDelay && this.combFeedback && this.combWet && this.combDry && this.combOut) {
      // feed input into comb block
      tail.connect(this.combIn);
      // wet path: input -> delay -> wet -> out
      this.combIn.connect(this.combDelay);
      this.combDelay.connect(this.combWet);
      this.combWet.connect(this.combOut);
      // dry path: input -> dry -> out
      tail.connect(this.combDry);
      this.combDry.connect(this.combOut);
      // feedback: delay -> feedback -> input
      this.combDelay.connect(this.combFeedback);
      this.combFeedback.connect(this.combIn);
      // tail is now combOut
      tail = this.combOut;
    }
    if (this.hicutEnabled && this.hicutNode) {
      tail.connect(this.hicutNode);
      tail = this.hicutNode;
    }

    if (!this.reverbEnabled) {
      tail.connect(this.outputGain);
      return;
    }
    if (!this.convolver || !this.wetGain || !this.dryGain) return;
    // reverb の wet/dry 分岐
    tail.connect(this.dryGain);
    tail.connect(this.convolver);
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

  // --- Hicut / Lowcut (master) ----------------------------------------
  private ensureCutNodes() {
    if (!this.ctx) return;
    if (!this.lowcutNode) {
      this.lowcutNode = this.ctx.createBiquadFilter();
      this.lowcutNode.type = 'highpass';
      this.lowcutNode.Q.value = Math.SQRT1_2; // バタワース相当
    }
    if (!this.hicutNode) {
      this.hicutNode = this.ctx.createBiquadFilter();
      this.hicutNode.type = 'lowpass';
      this.hicutNode.Q.value = Math.SQRT1_2;
    }
  }

  private mapLowcutHz(amount: number) {
    // 0 -> bypass, 1 -> ~1000Hz。指数マッピング
    const min = 20;
    const max = 1000;
    const a = Math.max(0, Math.min(1, amount));
    return min * Math.pow(max / min, a);
  }

  private mapHicutHz(amount: number) {
    // 0 -> bypass (~20kHz), 1 -> ~2kHz。指数マッピング（上から絞る）
    const nyq = this.ctx ? this.ctx.sampleRate / 2 : 22050;
    const min = 2000;
    const max = Math.min(20000, nyq);
    const a = Math.max(0, Math.min(1, amount));
    // amount=0 => max, amount=1 => min
    return max * Math.pow(min / max, a);
  }

  async setLowcutAmount(amount01: number) {
    this.lowcutAmount = Math.max(0, Math.min(1, amount01));
    this.lowcutEnabled = this.lowcutAmount > 0.0001;
    await this.ensureStarted();
    if (!this.ctx) return;
    this.ensureCutNodes();
    if (this.lowcutNode) {
      const hz = this.mapLowcutHz(this.lowcutAmount);
      this.lowcutNode.frequency.value = hz;
      this.lowcutNode.type = 'highpass';
      this.lowcutNode.Q.value = Math.SQRT1_2;
    }
    this.connectMasterToOutput();
  }

  async setHicutAmount(amount01: number) {
    this.hicutAmount = Math.max(0, Math.min(1, amount01));
    this.hicutEnabled = this.hicutAmount > 0.0001;
    await this.ensureStarted();
    if (!this.ctx) return;
    this.ensureCutNodes();
    if (this.hicutNode) {
      const hz = this.mapHicutHz(this.hicutAmount);
      this.hicutNode.frequency.value = hz;
      this.hicutNode.type = 'lowpass';
      this.hicutNode.Q.value = Math.SQRT1_2;
    }
    this.connectMasterToOutput();
  }

  // --- DIRTY (distortion) ---------------------------------------------
  private ensureDirtyNodes() {
    if (!this.ctx) return;
    if (!this.dirtyPreGain) {
      this.dirtyPreGain = this.ctx.createGain();
    }
    if (!this.dirtyShaper) {
      this.dirtyShaper = this.ctx.createWaveShaper();
      this.dirtyShaper.oversample = '4x';
    }
    if (!this.dirtyPostGain) {
      this.dirtyPostGain = this.ctx.createGain();
    }
  }

  private makeDistortionCurve(amount: number) {
    // amount 0..1 -> k 0..150
    const a = Math.max(0, Math.min(1, amount));
    const k = a * 150;
    const n_samples = 2048;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1; // -1..1
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  async setDirtyAmount(amount01: number) {
    this.dirtyAmount = Math.max(0, Math.min(1, amount01));
    this.dirtyEnabled = this.dirtyAmount > 0.0001;
    await this.ensureStarted();
    if (!this.ctx) return;
    this.ensureDirtyNodes();
    if (this.dirtyPreGain && this.dirtyShaper && this.dirtyPostGain) {
      // Map amount to drive and make-up gain
      const drive = 1 + this.dirtyAmount * 19; // 1..20x
      const makeup = 1 / Math.sqrt(1 + this.dirtyAmount * 15); // tame output
      this.dirtyPreGain.gain.value = drive;
      this.dirtyShaper.curve = this.makeDistortionCurve(this.dirtyAmount);
      this.dirtyPostGain.gain.value = makeup;
    }
    this.connectMasterToOutput();
  }

  // --- CRUSH (bitcrusher) ---------------------------------------------
  private async ensureBitcrusherNodes() {
    if (!this.ctx) return;
    if (this.bitcrusherNode) return;
    try {
      await this.ctx.audioWorklet.addModule('/worklets/bitcrusher-processor.js');
      this.bitcrusherNode = new AudioWorkletNode(this.ctx, 'bitcrusher-processor');
    } catch (_) {
      // AudioWorklet 未対応などの環境では無効化
      this.bitcrusherNode = null;
    }
  }

  private mapBitcrusherParams(amount: number) {
    const a = Math.max(0, Math.min(1, amount));
    const bits = 16 - Math.floor(a * 12); // 16..4bit
    const factor = 1 + Math.floor(a * 15); // 1..16x downsample
    return { bits: Math.max(1, bits), factor: Math.max(1, factor) };
  }

  async setCrushAmount(amount01: number) {
    // CRUSH now controls bitcrusher
    this.bitcrusherAmount = Math.max(0, Math.min(1, amount01));
    this.bitcrusherEnabled = this.bitcrusherAmount > 0.0001;
    await this.ensureStarted();
    if (!this.ctx) return;
    await this.ensureBitcrusherNodes();
    if (this.bitcrusherNode) {
      const { bits, factor } = this.mapBitcrusherParams(this.bitcrusherAmount);
      const pBits = this.bitcrusherNode.parameters.get('bits');
      const pFactor = this.bitcrusherNode.parameters.get('downsample');
      if (pBits) pBits.value = bits;
      if (pFactor) pFactor.value = factor;
    }
    this.connectMasterToOutput();
  }

  // --- COMB (flanger/comb filter) -------------------------------------
  private ensureCombNodes() {
    if (!this.ctx) return;
    if (!this.combIn) this.combIn = this.ctx.createGain();
    if (!this.combDelay) this.combDelay = this.ctx.createDelay(0.05); // up to 50ms
    if (!this.combFeedback) this.combFeedback = this.ctx.createGain();
    if (!this.combWet) this.combWet = this.ctx.createGain();
    if (!this.combDry) this.combDry = this.ctx.createGain();
    if (!this.combOut) this.combOut = this.ctx.createGain();
    // LFO to modulate delayTime
    if (!this.combLFO) {
      this.combLFO = this.ctx.createOscillator();
      this.combLFO.type = 'sine';
      this.combLFO.frequency.value = 0.25; // base speed
      this.combLFO.start();
    }
    if (!this.combLFOGain) this.combLFOGain = this.ctx.createGain();
    // Ensure LFO connected to delayTime
    try { this.combLFO.disconnect(); } catch (_) { /* no-op */ }
    this.combLFO.connect(this.combLFOGain!);
    this.combLFOGain!.connect(this.combDelay!.delayTime);
  }

  private mapCombParams(amount: number) {
    const a = Math.max(0, Math.min(1, amount));
    // Base delay 0.2ms..6ms, depth 0..5ms, feedback 0..0.8, wet 0..0.6, speed 0.1..0.6 Hz
    const baseMs = 0.0002 + a * 0.006; // sec
    const depthMs = a * 0.005; // sec
    const feedback = 0.1 + a * 0.7;
    const wet = 0.15 + a * 0.45;
    const dry = 1 - wet;
    const speed = 0.15 + a * 0.45;
    return { base: baseMs, depth: depthMs, feedback, wet, dry, speed };
  }

  async setCombAmount(amount01: number) {
    this.combAmount = Math.max(0, Math.min(1, amount01));
    this.combEnabled = this.combAmount > 0.0001;
    await this.ensureStarted();
    if (!this.ctx) return;
    this.ensureCombNodes();
    const p = this.mapCombParams(this.combAmount);
    if (this.combDelay && this.combFeedback && this.combWet && this.combDry && this.combLFOGain && this.combLFO) {
      // Set base delay as DC offset by setting value and LFO depth around it.
      this.combDelay.delayTime.value = p.base;
      this.combLFOGain.gain.value = p.depth;
      this.combLFO.frequency.value = p.speed;
      this.combFeedback.gain.value = p.feedback;
      this.combWet.gain.value = p.wet;
      this.combDry.gain.value = p.dry;
    }
    this.connectMasterToOutput();
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
