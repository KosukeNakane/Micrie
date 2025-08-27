// 外部ファイルを使わず、常に即席IR（指数減衰ノイズ）を生成して返すユーティリティ。
// 生成したIRはキャッシュし、以降は同じAudioContextで再利用する。

const cache = new WeakMap<AudioContext, AudioBuffer>();

export async function loadImpulse(_: string | undefined, ctx: AudioContext): Promise<AudioBuffer> {
  const cached = cache.get(ctx);
  if (cached) return cached;

  // 疑似IR（ステレオ 1.5秒、指数減衰ノイズ）
  const duration = 1.5;
  const sr = ctx.sampleRate || 48000;
  const len = Math.floor(duration * sr);
  const buffer = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      // ホワイトノイズ * 指数減衰
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 6);
    }
  }
  cache.set(ctx, buffer);
  return buffer;
}
