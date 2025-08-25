import { useEffect, useState } from "react";

import { useAudioBuffer } from "@entities/audio/model/useAudioBuffer";
import { useBarCount } from "@entities/bar-count/model/BarCountContext";
import { useSegment } from "@entities/segment/model/SegmentContext";
import { useTempo } from "@entities/tempo/model/TempoContext";
import { apiFetch } from "@shared/api/apiClient";

const DEBUG = false;
type TrimMemo = { duration: number; trimmed: Blob };
const trimMemo = new WeakMap<Blob, TrimMemo>();
const processedDuration = new WeakMap<Blob, number>();

export const useMelodyFileProcessing = (audioBlob: Blob | null, triggerKey?: number, enableTrimming: boolean = false) => {
  const { setMelodySegments, setContextAudioBuffer } = useSegment();
  const { barCount } = useBarCount();
  const { tempo } = useTempo();
  const [trimmedBlob, setTrimmedBlob] = useState<Blob | null>(null);

  const audioBuffer = useAudioBuffer(trimmedBlob);
  useEffect(() => { if (audioBuffer) setContextAudioBuffer("melody", audioBuffer); }, [audioBuffer, setContextAudioBuffer]);

  useEffect(() => {
    if (!audioBlob) { if (DEBUG) console.log("audioBlob 未設定"); return; }
    const controller = new AbortController();
    const { signal } = controller;

    const adjustAudioLength = async (blob: Blob, expectedSec: number): Promise<Blob> => {
      const audioCtx = new AudioContext();
      const arrayBuffer = await blob.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      const sampleRate = decoded.sampleRate; const expectedLength = sampleRate * expectedSec;
      let trimmed: AudioBuffer;
      if (decoded.length > expectedLength) {
        trimmed = audioCtx.createBuffer(decoded.numberOfChannels, expectedLength, sampleRate);
        for (let ch = 0; ch < decoded.numberOfChannels; ch++) trimmed.copyToChannel(decoded.getChannelData(ch).slice(0, expectedLength), ch);
      } else {
        trimmed = audioCtx.createBuffer(decoded.numberOfChannels, expectedLength, sampleRate);
        for (let ch = 0; ch < decoded.numberOfChannels; ch++) { const src = decoded.getChannelData(ch); const padded = new Float32Array(expectedLength); padded.set(src); trimmed.copyToChannel(padded, ch); }
      }
      const realCtx = new AudioContext(); const dest = realCtx.createMediaStreamDestination(); const srcNode = realCtx.createBufferSource();
      srcNode.buffer = trimmed; srcNode.connect(dest); srcNode.connect(realCtx.destination);
      const recorder = new MediaRecorder(dest.stream); const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      return new Promise((resolve) => { recorder.onstop = () => { const out = new Blob(chunks, { type: "audio/webm" }); realCtx.close().catch(() => { }); audioCtx.close().catch(() => { }); resolve(out); }; recorder.start(); srcNode.start(); setTimeout(() => recorder.stop(), expectedSec * 1000); });
    };

    const expectedDuration = (60 / tempo) * 4 * barCount;
    const already = processedDuration.get(audioBlob);
    if (already !== undefined && Math.abs(already - expectedDuration) < 1e-6) {
      const memo = trimMemo.get(audioBlob);
      if (enableTrimming && memo && Math.abs(memo.duration - expectedDuration) < 1e-6) setTrimmedBlob(memo.trimmed);
      else if (!enableTrimming) setTrimmedBlob(audioBlob);
      return;
    }

    const process = async () => {
      let adjustedBlob: Blob = audioBlob;
      if (enableTrimming) adjustedBlob = await adjustAudioLength(audioBlob, expectedDuration);
      if (enableTrimming) trimMemo.set(audioBlob, { duration: expectedDuration, trimmed: adjustedBlob });
      processedDuration.set(audioBlob, expectedDuration);
      setTrimmedBlob(adjustedBlob);
      if (adjustedBlob.size < 1000) return;
      const formData = new FormData(); formData.append("file", adjustedBlob); formData.append("tempo", tempo.toString()); formData.append("bar_count", barCount.toString());
      apiFetch("pitch", { method: "POST", body: formData, signal })
        .then((data: any) => {
          const totalDuration = (60 / tempo) * 4 * barCount; const chunkDuration = totalDuration / data.pitch_series.length;
          const segments = data.pitch_series.map((seg: any, index: number) => {
            const start = chunkDuration * index; const end = chunkDuration * (index + 1);
            const note = seg.note ?? (seg.label === 'rest' ? 'rest' : 'error');
            const label = seg.label ?? (note === 'rest' ? '—' : 'error');
            return { label, note, hz: seg.hz, start, end, confidence: seg.confidence, rms: seg.rms, confidence_rms: seg.confidence_rms };
          });
          setMelodySegments(segments);
        })
        .catch((err) => { if (DEBUG) console.error("Pitch解析エラー:", err); });
    };

    process();
    return () => {
      // クリーンアップ: すでに中断済みでなければ abort() を呼ぶ。
      if (!controller.signal.aborted) {
        controller.abort();
      }
    };
  }, [audioBlob, triggerKey]);

  return { trimmedBlob };
};
