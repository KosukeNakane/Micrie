// [Lib] features/sampler - audioTrim.ts
// 役割: サンプラー録音の先頭無音をトリムする純関数ユーティリティ

export type TrimOptions = {
  threshold?: number; // RMSしきい値 (0..1)
  windowMs?: number; // RMS計測窓幅
  prerollMs?: number; // 切り落とし前に残す余裕
};

export const trimAudioBuffer = (
  buffer: AudioBuffer,
  { threshold = 0.02, windowMs = 10, prerollMs = 5 }: TrimOptions = {}
): { buffer: AudioBuffer; trimmed: boolean; removedSamples: number } => {
  const sampleRate = buffer.sampleRate;
  if (!sampleRate || buffer.length === 0) return { buffer, trimmed: false, removedSamples: 0 };

  const windowSize = Math.max(1, Math.round((windowMs / 1000) * sampleRate));
  const preroll = Math.max(0, Math.round((prerollMs / 1000) * sampleRate));
  const channelData = buffer.getChannelData(0); // 先頭チャンネルのみで検出

  let firstLoudSample = 0;
  let found = false;
  for (let i = 0; i < channelData.length; i += windowSize) {
    let sum = 0;
    const end = Math.min(channelData.length, i + windowSize);
    for (let j = i; j < end; j++) {
      const v = channelData[j];
      sum += v * v;
    }
    const rms = Math.sqrt(sum / (end - i));
    if (rms > threshold) {
      firstLoudSample = Math.max(0, i - preroll);
      found = true;
      break;
    }
  }

  if (!found || firstLoudSample <= 0) {
    return { buffer, trimmed: false, removedSamples: 0 };
  }

  const newLength = buffer.length - firstLoudSample;
  if (newLength <= 0) return { buffer, trimmed: false, removedSamples: 0 };

  const trimmed = new AudioBuffer({ length: newLength, numberOfChannels: buffer.numberOfChannels, sampleRate });
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = trimmed.getChannelData(ch);
    dst.set(src.subarray(firstLoudSample));
  }

  return { buffer: trimmed, trimmed: true, removedSamples: firstLoudSample };
};

export const audioBufferToWavBlob = (buffer: AudioBuffer): Blob => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels;
  const pcmData = new Float32Array(length);

  // interleave channels
  for (let ch = 0; ch < numChannels; ch++) {
    const channel = buffer.getChannelData(ch);
    for (let i = 0; i < buffer.length; i++) {
      pcmData[i * numChannels + ch] = channel[i];
    }
  }

  // 16bit PCM WAV
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const bufferLength = 44 + pcmData.length * bytesPerSample;
  const wavBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(wavBuffer);

  let offset = 0;
  const writeString = (str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    offset += str.length;
  };

  writeString('RIFF');
  view.setUint32(offset, 36 + pcmData.length * bytesPerSample, true); offset += 4;
  writeString('WAVE');
  writeString('fmt ');
  view.setUint32(offset, 16, true); offset += 4; // fmt chunk size
  view.setUint16(offset, 1, true); offset += 2; // PCM
  view.setUint16(offset, numChannels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * blockAlign, true); offset += 4; // byte rate
  view.setUint16(offset, blockAlign, true); offset += 2;
  view.setUint16(offset, bytesPerSample * 8, true); offset += 2;
  writeString('data');
  view.setUint32(offset, pcmData.length * bytesPerSample, true); offset += 4;

  // PCM data
  let outIdx = offset;
  for (let i = 0; i < pcmData.length; i++, outIdx += 2) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    view.setInt16(outIdx, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
};
