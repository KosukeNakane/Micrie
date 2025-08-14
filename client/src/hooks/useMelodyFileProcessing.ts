// メロディー用の音声ファイルを受け取り、必要に応じて長さ調整・サーバー送信・解析を行うカスタムフック。
// pitch_series を元にメロディセグメントを生成し、コンテキストに保存する。
import { useEffect, useState } from "react";
import { useSegment } from "../context/SegmentContext";
import { useBarCount } from "../context/BarCountContext";
import { useTempo } from "../context/TempoContext";
import { useAudioBuffer } from "./useAudioBuffer";

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
      console.log("🔁 audioBlob が設定されていないため、処理をスキップします。");
      return;
    }

    console.log("🎬 audioBlob の処理を開始します");

    // 音声の長さを expectedSec に合わせて切り詰め or パディングし、WebM に再エンコード
    const adjustAudioLength = async (blob: Blob, expectedSec: number): Promise<Blob> => {
      console.log("⏳ 音声長を調整中...");
      const audioCtx = new AudioContext();
      const arrayBuffer = await blob.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);

      const sampleRate = decoded.sampleRate;
      const expectedLength = sampleRate * expectedSec;

      let trimmed: AudioBuffer;
      if (decoded.length > expectedLength) {
        console.log("✂️ 音声をトリミングします");
        trimmed = audioCtx.createBuffer(decoded.numberOfChannels, expectedLength, sampleRate);
        for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
          trimmed.copyToChannel(decoded.getChannelData(ch).slice(0, expectedLength), ch);
        }
      } else {
        console.log("📏 無音を追加して音声をパディングします");
        trimmed = audioCtx.createBuffer(decoded.numberOfChannels, expectedLength, sampleRate);
        for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
          const sourceData = decoded.getChannelData(ch);
          const paddedData = new Float32Array(expectedLength);
          paddedData.set(sourceData);
          trimmed.copyToChannel(paddedData, ch);
        }
      }

      console.log("🎙️ WebM 形式で再エンコード中...");
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
          resolve(new Blob(chunks, { type: "audio/webm" }));
        };
        recorder.start();
        src.start();
        setTimeout(() => {
          recorder.stop();
        }, expectedSec * 1000);
      });
    };

    // 全体処理のメインロジック：長さ調整・送信・レスポンス処理
    const process = async () => {
      console.log("📐 tempo と barCount に基づいて想定長を計算します");
      const expectedDuration = (60 / tempo) * 4 * barCount;

      let adjustedBlob: Blob;
      if (enableTrimming) {
        adjustedBlob = await adjustAudioLength(audioBlob, expectedDuration);
      } else {
        adjustedBlob = audioBlob;
      }

      setTrimmedBlob(adjustedBlob);

      console.log("📤 adjustedBlob をサーバーに送信します");

      // Blob が小さすぎる場合は不正とみなしてスキップ
      if (adjustedBlob.size < 1000) {
        console.warn("⚠️ adjustedBlob が小さすぎるため、送信を中止します");
        return;
      }

      const formData = new FormData();
      formData.append("file", adjustedBlob);
      formData.append("tempo", tempo.toString());
      formData.append("bar_count", barCount.toString());

      fetch("${baseUrl}/pitch", {
        method: "POST",
        body: formData,
      })
        .then((res) => {
          console.log("📥 サーバーからの応答を受信しました");
          if (!res.ok) throw new Error("サーバーエラー: " + res.status);
          return res.json();
        })
        // pitch_series をもとに時間情報付きのセグメントを生成
        .then((data) => {
          console.log("🧠 pitch_series の解析結果を処理します");
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
          console.error("❌ Pitch解析エラー:", err);
        });
    };

    process();
  }, [audioBlob, triggerKey]);

  // 外部で再利用できるようトリミング済みBlobを返す
  return { trimmedBlob };
};