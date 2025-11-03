// [Model] widgets/model - useWaveformSamplerRecorder.ts
// 役割: WaveformDisplay向けのサンプラーパッド録音ロジックをカプセル化

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  SAMPLER_PAD_COUNT,
  useSamplerStore,
  useGlobalAudio,
  type SamplerPad,
} from "@entities/audio";

const RE_RECORD_LONG_PRESS_MS = 320;
const SIMPLE_TOGGLE_MODE = true;

const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
] as const;

const isNavigatorAvailable = () =>
  typeof window !== "undefined" &&
  typeof navigator !== "undefined" &&
  !!navigator.mediaDevices?.getUserMedia;

export const useWaveformSamplerRecorder = () => {
  const pads = useSamplerStore((state) => state.pads);
  const setSamplerPad = useSamplerStore((state) => state.setPad);
  const [isSamplerRecording, setIsSamplerRecording] = useState(false);
  const [recordingPadIndex, setRecordingPadIndex] = useState<number | null>(null);

  const engine = useGlobalAudio();

  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderStreamRef = useRef<MediaStream | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const activeRecorderPadRef = useRef<number | null>(null);
  const samplerRecordingRef = useRef(false);
  const skipFinalizeRef = useRef(false);
  const pressTimeoutsRef = useRef<number[]>(
    Array.from({ length: SAMPLER_PAD_COUNT }, () => 0)
  );
  const suppressClickRef = useRef<boolean[]>(
    Array.from({ length: SAMPLER_PAD_COUNT }, () => false)
  );

  useEffect(() => {
    if (pressTimeoutsRef.current.length !== pads.length) {
      pressTimeoutsRef.current = Array.from({ length: pads.length }, (_, index) =>
        pressTimeoutsRef.current[index] ?? 0
      );
    }
    if (suppressClickRef.current.length !== pads.length) {
      suppressClickRef.current = Array.from({ length: pads.length }, (_, index) =>
        suppressClickRef.current[index] ?? false
      );
    }
  }, [pads.length]);

  const setActiveRecorderPad = useCallback((index: number | null) => {
    activeRecorderPadRef.current = index;
    setRecordingPadIndex(index);
  }, []);

  const clearPressTimeout = useCallback((index: number) => {
    const timeoutId = pressTimeoutsRef.current[index];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      pressTimeoutsRef.current[index] = 0;
    }
  }, []);

  const cleanupRecorder = useCallback(() => {
    recorderStreamRef.current?.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        /* no-op */
      }
    });
    recorderStreamRef.current = null;
    recorderRef.current = null;
    recorderChunksRef.current = [];
    samplerRecordingRef.current = false;
    skipFinalizeRef.current = false;
    setIsSamplerRecording(false);
    setActiveRecorderPad(null);
  }, [setActiveRecorderPad]);

  const finalizePadRecording = useCallback(
    async (index: number, blob: Blob) => {
      if (!blob || blob.size === 0) {
        setSamplerPad(index, () => ({
          status: "error",
          buffer: null,
          blob: null,
          error: "音声を取得できませんでした",
          updatedAt: Date.now(),
        }));
        return;
      }

      try {
        await engine.ensureStarted();
        const ctx = engine.audioContext;
        if (!ctx) {
          throw new Error("AudioContext の初期化に失敗しました");
        }
        const arrayBuffer = await blob.arrayBuffer();
        const decoded = await new Promise<AudioBuffer>((resolve, reject) => {
          ctx.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
        });

        setSamplerPad(index, () => ({
          status: "ready",
          buffer: decoded,
          blob,
          error: undefined,
          updatedAt: Date.now(),
        }));
      } catch (error) {
        console.error("[sampler] finalize error", error);
        setSamplerPad(index, () => ({
          status: "error",
          buffer: null,
          blob: null,
          error:
            error instanceof Error
              ? error.message
              : "録音した音声を処理できませんでした",
          updatedAt: Date.now(),
        }));
      }
    },
    [engine, setSamplerPad]
  );

  const stopPadRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    try {
      recorder.stop();
    } catch (error) {
      console.warn("[sampler] failed to stop recorder", error);
      cleanupRecorder();
    }
  }, [cleanupRecorder]);

  const playPad = useCallback(
    async (index: number) => {
      const pad = pads[index];
      if (!pad || !pad.buffer) return;
      try {
        await engine.ensureStarted();
        const ctx = engine.audioContext;
        if (!ctx) {
          throw new Error("AudioContext の初期化に失敗しました");
        }
        const source = ctx.createBufferSource();
        source.buffer = pad.buffer;
        const destination = engine.getChannelInput("sampler");
        if (destination) {
          source.connect(destination);
        } else {
          source.connect(ctx.destination);
        }
        source.start();
        source.onended = () => {
          try {
            source.disconnect();
          } catch {
            /* no-op */
          }
        };
      } catch (error) {
        console.error("[sampler] playback error", error);
        setSamplerPad(index, (prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "再生に失敗しました",
        }));
      }
    },
    [engine, pads, setSamplerPad]
  );

  const startPadRecording = useCallback(
    async (index: number) => {
      if (samplerRecordingRef.current) return;
      samplerRecordingRef.current = true;
      setIsSamplerRecording(true);
      skipFinalizeRef.current = false;
      suppressClickRef.current[index] = true;
      recorderChunksRef.current = [];

      try {
        if (!isNavigatorAvailable()) {
          throw new Error("このブラウザでは録音機能が利用できません");
        }

        await engine.ensureStarted();
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1 },
        });
        recorderStreamRef.current = stream;

        const selectedType =
          typeof MediaRecorder !== "undefined" &&
          typeof MediaRecorder.isTypeSupported === "function"
            ? PREFERRED_MIME_TYPES.find((type) =>
                MediaRecorder.isTypeSupported(type)
              )
            : undefined;

        const recorder = selectedType
          ? new MediaRecorder(stream, { mimeType: selectedType })
          : new MediaRecorder(stream);

        recorderRef.current = recorder;
        setActiveRecorderPad(index);
        setSamplerPad(index, (prev) => ({
          ...prev,
          status: "recording",
          error: undefined,
        }));

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recorderChunksRef.current.push(event.data);
          }
        };

        recorder.onerror = (event) => {
          console.error("[sampler] recorder error", event.error);
          skipFinalizeRef.current = true;
          setSamplerPad(index, () => ({
            status: "error",
            buffer: null,
            blob: null,
            error:
              event.error?.message ?? "録音に失敗しました",
            updatedAt: Date.now(),
          }));
          try {
            recorder.stop();
          } catch {
            cleanupRecorder();
          }
        };

        recorder.onstop = () => {
          const mimeType = recorder.mimeType || selectedType || "";
          const blob =
            mimeType && recorderChunksRef.current.length
              ? new Blob(recorderChunksRef.current, { type: mimeType })
              : new Blob(recorderChunksRef.current);
          recorderChunksRef.current = [];

          if (skipFinalizeRef.current) {
            skipFinalizeRef.current = false;
            cleanupRecorder();
            return;
          }

          finalizePadRecording(index, blob)
            .catch((error) => {
              console.error("[sampler] finalize error", error);
              setSamplerPad(index, () => ({
                status: "error",
                buffer: null,
                blob: null,
                error:
                  error instanceof Error
                    ? error.message
                    : "録音データの処理に失敗しました",
                updatedAt: Date.now(),
              }));
            })
            .finally(() => {
              cleanupRecorder();
            });
        };

        recorder.start(100);
      } catch (error) {
        console.error("[sampler] failed to start recording", error);
        skipFinalizeRef.current = false;
        setSamplerPad(index, () => ({
          status: "error",
          buffer: null,
          blob: null,
          error:
            error instanceof Error ? error.message : "録音に失敗しました",
          updatedAt: Date.now(),
        }));
        cleanupRecorder();
      }
    },
    [cleanupRecorder, engine, finalizePadRecording, setActiveRecorderPad, setSamplerPad]
  );

  const handlePadPointerDown = useCallback(
    (index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* pointer capture may fail */
      }

      if (samplerRecordingRef.current) return;

      suppressClickRef.current[index] = false;
      const pad = pads[index];

      if (pad.status === "ready" && !SIMPLE_TOGGLE_MODE) {
        clearPressTimeout(index);
        pressTimeoutsRef.current[index] = window.setTimeout(() => {
          pressTimeoutsRef.current[index] = 0;
          if (samplerRecordingRef.current) return;
          suppressClickRef.current[index] = true;
          void startPadRecording(index);
        }, RE_RECORD_LONG_PRESS_MS);
      } else if (pad.status !== "recording") {
        suppressClickRef.current[index] = true;
        void startPadRecording(index);
      }
    },
    [clearPressTimeout, pads, startPadRecording]
  );

  const handlePadPointerUp = useCallback(
    (index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      clearPressTimeout(index);
      if (activeRecorderPadRef.current === index) {
        stopPadRecording();
      }
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    },
    [clearPressTimeout, stopPadRecording]
  );

  const handlePadPointerLeave = useCallback(
    (index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      clearPressTimeout(index);

      const element = event.currentTarget as HTMLButtonElement;
      const hasCapture =
        typeof element.hasPointerCapture === "function" &&
        element.hasPointerCapture(event.pointerId);
      if (!hasCapture) return;

      if (activeRecorderPadRef.current === index) {
        stopPadRecording();
      }
    },
    [clearPressTimeout, stopPadRecording]
  );

  const handlePadPointerCancel = useCallback(
    (index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      clearPressTimeout(index);
      if (activeRecorderPadRef.current === index) {
        stopPadRecording();
      }
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    },
    [clearPressTimeout, stopPadRecording]
  );

  const handlePadClick = useCallback(
    (index: number) => () => {
      if (SIMPLE_TOGGLE_MODE) {
        const activeIndex = activeRecorderPadRef.current;
        const recorder = recorderRef.current;
        if (activeIndex === index && recorder && recorder.state === "recording") {
          stopPadRecording();
          return;
        }
        if (samplerRecordingRef.current) return;
        void startPadRecording(index);
        return;
      }

      if (suppressClickRef.current[index]) {
        suppressClickRef.current[index] = false;
        return;
      }
      if (samplerRecordingRef.current) return;
      const pad = pads[index];
      if (pad.status !== "ready" || !pad.buffer) return;
      void playPad(index);
    },
    [pads, playPad, startPadRecording, stopPadRecording]
  );

  useEffect(
    () => () => {
      pressTimeoutsRef.current.forEach((timeoutId) => {
        if (timeoutId) window.clearTimeout(timeoutId);
      });
      suppressClickRef.current.fill(false);
      const activeIndex = activeRecorderPadRef.current;
      const padBeforeCleanup =
        typeof activeIndex === "number" ? pads[activeIndex] : undefined;
      skipFinalizeRef.current = true;
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {
          cleanupRecorder();
        }
      } else {
        cleanupRecorder();
      }
      if (typeof activeIndex === "number" && padBeforeCleanup) {
        setSamplerPad(activeIndex, (prev) => ({
          ...prev,
          status: prev.buffer ? "ready" : "empty",
        }));
      }
    },
    [cleanupRecorder, pads, setSamplerPad]
  );

  const formatDuration = useCallback((duration: number | undefined) => {
    if (!duration || !Number.isFinite(duration)) return "";
    if (duration >= 1) return `${duration.toFixed(1)}s`;
    return `${Math.round(duration * 1000)}ms`;
  }, []);

  const getPadHint = useCallback((pad: SamplerPad): string => {
    if (pad.status === "recording") {
      return SIMPLE_TOGGLE_MODE ? "Tap to stop" : "Recording…";
    }
    if (pad.status === "ready") {
      return SIMPLE_TOGGLE_MODE
        ? "Tap to play"
        : "Tap to play / hold to re-record";
    }
    if (pad.status === "error") {
      return SIMPLE_TOGGLE_MODE ? "Tap to retry" : "Tap & hold to retry";
    }
    return SIMPLE_TOGGLE_MODE ? "Tap to record" : "Hold to record";
  }, []);

  const getPadMeta = useCallback(
    (pad: SamplerPad): string | undefined => {
      if (pad.status === "recording") return "Release to stop";
      if (pad.status === "ready" && pad.buffer) {
        return formatDuration(pad.buffer.duration);
      }
      if (pad.status === "error") return pad.error;
      if (pad.updatedAt) {
        return new Date(pad.updatedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      }
      return undefined;
    },
    [formatDuration]
  );

  const value = useMemo(
    () => ({
      pads,
      isSamplerRecording,
      recordingPadIndex,
      handlePadPointerDown,
      handlePadPointerUp,
      handlePadPointerLeave,
      handlePadPointerCancel,
      handlePadClick,
      getPadHint,
      getPadMeta,
    }),
    [
      pads,
      isSamplerRecording,
      recordingPadIndex,
      handlePadPointerDown,
      handlePadPointerUp,
      handlePadPointerLeave,
      handlePadPointerCancel,
      handlePadClick,
      getPadHint,
      getPadMeta,
    ]
  );

  return value;
};
