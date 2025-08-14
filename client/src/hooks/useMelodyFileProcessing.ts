// メロディー用の音声ファイルを受け取り、必要に応じて長さ調整・サーバー送信・解析を行うカスタムフック。
// pitch_series を元にメロディセグメントを生成し、コンテキストに保存する。
import { useEffect, useState } from "react";
import { useSegment } from "../context/SegmentContext";
import { useBarCount } from "../context/BarCountContext";
import { useTempo } from "../context/TempoContext";
import { useAudioBuffer } from "./useAudioBuffer";

// ---- debug flag & memoization (module scope) ----
const DEBUG = false; // true にするとログが出ます

// トリミング結果を Blob 単位でキャッシュ（同じ Blob + 同じ想定長なら再計算しない）
type TrimMemo = { duration: number; trimmed: Blob };
const trimMemo = new WeakMap<Blob, TrimMemo>();

// サーバー送信まで完了した "処理済み" の印（同じ Blob + 同じ想定長なら再送しない）
const processedDuration = new WeakMap<Blob, number>();

export const useMelodyFileProcessing = (audioBlob: Blob | null, triggerKey?: number, enableTrimming: boolean = false) => {
  const { setMelodySegments, setContextAudioBuffer } = useSegment();
  const { barCount } = useBarCount();
  const { tempo } = useTempo();
  const [trimmedBlob, setTrimmedBlob] = useState<Blob | null>(null);

  // トリミング済みBlobをAudioBufferに変換
  const audioBuffer = useAudioBuffer(trimmedBlob);

  // AudioBuffer が取得できたら、"melody" としてグローバルコンテキストにセット
  useEffect(() => {
    if (audioBuffer) {
      setContextAudioBuffer("melody", audioBuffer);
    }
  }, [audioBuffer, setContextAudioBuffer]);

  // audioBlobが指定されたときに処理を開始
  useEffect(() => {
    if (!audioBlob) {
      if (DEBUG) console.log("🔁 audioBlob が未設定のため、処理をスキップ");
      return;
    }
    if (DEBUG) console.log("🎬 audioBlob の処理を開始します");

    const controller = new AbortController();
    const { signal } = controller;

    const adjustAudioLength = async (blob: Blob, expectedSec: number): Promise<Blob> => {
      if (DEBUG) console.log("⏳ 音声長を調整中...");
      const audioCtx = new AudioContext();
      const arrayBuffer = await blob.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);

      const sampleRate = decoded.sampleRate;
      const expectedLength = sampleRate * expectedSec;

      let trimmed: AudioBuffer;
      if (decoded.length > expectedLength) {
        if (DEBUG) console.log("✂️ 音声をトリミングします");
        trimmed = audioCtx.createBuffer(decoded.numberOfChannels, expectedLength, sampleRate);
        for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
          trimmed.copyToChannel(decoded.getChannelData(ch).slice(0, expectedLength), ch);
        }
      } else {
        if (DEBUG) console.log("📏 無音を追加して音声をパディングします");
        trimmed = audioCtx.createBuffer(decoded.numberOfChannels, expectedLength, sampleRate);
        for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
          const sourceData = decoded.getChannelData(ch);
          const paddedData = new Float32Array(expectedLength);
          paddedData.set(sourceData);
          trimmed.copyToChannel(paddedData, ch);
        }
      }

      if (DEBUG) console.log("🎙️ WebM 形式で再エンコード中...");
      const realCtx = new AudioContext();
      const dest = realCtx.createMediaStreamDestination();
      const src = realCtx.createBufferSource();
      src.buffer = trimmed;
      src.connect(dest);
      src.connect(realCtx.destination);

      const recorder = new MediaRecorder(dest.stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      return new Promise((resolve) => {
        recorder.onstop = () => {
          const out = new Blob(chunks, { type: "audio/webm" });
          realCtx.close().catch(() => { });
          audioCtx.close().catch(() => { });
          resolve(out);
        };
        recorder.start();
        src.start();
        setTimeout(() => {
          recorder.stop();
        }, expectedSec * 1000);
      });
    };

    // ここで想定長を算出して、同一パラメータなら処理をスキップ
    const expectedDuration = (60 / tempo) * 4 * barCount;

    const already = processedDuration.get(audioBlob);
    if (already !== undefined && Math.abs(already - expectedDuration) < 1e-6) {
      if (DEBUG) console.log("✅ 既処理のため再送・再計算をスキップ");
      const memo = trimMemo.get(audioBlob);
      if (enableTrimming && memo && Math.abs(memo.duration - expectedDuration) < 1e-6) {
        setTrimmedBlob(memo.trimmed);
      } else if (!enableTrimming) {
        setTrimmedBlob(audioBlob);
      }
      return;
    }

    const process = async () => {
      if (DEBUG) console.log("📐 tempo と barCount に基づいて想定長を計算します");

      let adjustedBlob: Blob;
      if (enableTrimming) {
        adjustedBlob = await adjustAudioLength(audioBlob, expectedDuration);
      } else {
        adjustedBlob = audioBlob;
      }

      if (enableTrimming) {
        trimMemo.set(audioBlob, { duration: expectedDuration, trimmed: adjustedBlob });
      }
      processedDuration.set(audioBlob, expectedDuration);

      setTrimmedBlob(adjustedBlob);

      if (DEBUG) console.log("📤 adjustedBlob をサーバーに送信します");

      // Blob が小さすぎる場合は不正とみなしてスキップ
      if (adjustedBlob.size < 1000) {
        if (DEBUG) console.warn("⚠️ adjustedBlob が小さすぎるため、送信を中止します");
        return;
      }

      const formData = new FormData();
      formData.append("file", adjustedBlob);
      formData.append("tempo", tempo.toString());
      formData.append("bar_count", barCount.toString());

      fetch("${baseUrl}/pitch", {
        method: "POST",
        body: formData,
        signal,
      })
        .then((res) => {
          if (DEBUG) console.log("📥 サーバーからの応答を受信しました");
          if (!res.ok) throw new Error("サーバーエラー: " + res.status);
          return res.json();
        })
        //pitch_series をもとに時間情報付きのセグメントを生成
        .then((data) => {
          if (DEBUG) console.log("🧠 pitch_series の解析結果を処理します");
          const totalDuration = (60 / tempo) * 4 * barCount;
          const chunkDuration = totalDuration / data.pitch_series.length;
          const segments = data.pitch_series.map((seg: any, index: number) => {
            const start = chunkDuration * index;
            const end = chunkDuration * (index + 1);
            const note = seg.note ?? (seg.label === 'rest' ? 'rest' : 'error');
            const label = seg.label ?? (note === 'rest' ? '—' : 'error');
            return {
              label,
              note,
              hz: seg.hz,
              start,
              end,
              confidence: seg.confidence,
              rms: seg.rms,
              confidence_rms: seg.confidence_rms,
            };
          });
          setMelodySegments(segments);
        })
        .catch((err) => {
          if (DEBUG) console.error("❌ Pitch解析エラー:", err);
        });
    };

    process();
    return () => {
      try { controller.abort(); } catch { }
    };
  }, [audioBlob, triggerKey]);

  // 外部で再利用できるようトリミング済みBlobを返す
  return { trimmedBlob };
};