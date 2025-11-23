// [Model] features/model - useSamplerRecorder.ts
// 役割: サンプラーパッドの録音・再生ロジックをカプセル化（Waveformなどで利用）

import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type PointerEvent as ReactPointerEvent,
} from 'react';

import {
	SAMPLER_PAD_COUNT,
	useSamplerStore,
	useGlobalAudio,
	type SamplerPad,
} from '@entities/audio';

import { audioBufferToWavBlob, trimAudioBuffer } from '@/features/sampler/lib/audioTrim';

const SIMPLE_TOGGLE_MODE = false;
const SHORT_PRESS_MS = 200;

const PREFERRED_MIME_TYPES = [
	'audio/webm;codecs=opus',
	'audio/webm',
	'audio/ogg;codecs=opus',
	'audio/mp4;codecs=mp4a.40.2',
	'audio/mp4',
] as const;

const isNavigatorAvailable = () =>
	typeof window !== 'undefined' &&
	typeof navigator !== 'undefined' &&
	!!navigator.mediaDevices?.getUserMedia;

export const useSamplerRecorder = () => {
	const pads = useSamplerStore((state) => state.pads);
	const setSamplerPad = useSamplerStore((state) => state.setPad);
	const [isSamplerRecording, setIsSamplerRecording] = useState(false);
	const [recordingPadIndex, setRecordingPadIndex] = useState<number | null>(null);
	const [trimEnabled, setTrimEnabled] = useState(true);
	const [lastPlayedBuffer, setLastPlayedBuffer] = useState<AudioBuffer | null>(null);
	const [playbackProgress, setPlaybackProgress] = useState<number | null>(null);
	const [lastPlayedPadIndex, setLastPlayedPadIndex] = useState<number | null>(null);
	const [lastPlayedPadSeq, setLastPlayedPadSeq] = useState(0);
	const progressRafRef = useRef<number | null>(null);

	const engine = useGlobalAudio();
	const resetPad = useSamplerStore((state) => state.resetPad);

	const recorderRef = useRef<MediaRecorder | null>(null);
	const recorderStreamRef = useRef<MediaStream | null>(null);
	const recorderChunksRef = useRef<Blob[]>([]);
	const activeRecorderPadRef = useRef<number | null>(null);
	const samplerRecordingRef = useRef(false);
	const skipFinalizeRef = useRef(false);
	const suppressClickRef = useRef<boolean[]>(
		Array.from({ length: SAMPLER_PAD_COUNT }, () => false)
	);
	const padsRef = useRef(pads);
	const recordingStartRef = useRef<number | null>(null);
	const shortPlaybackIndexRef = useRef<number | null>(null);
	useEffect(() => {
		padsRef.current = pads;
	}, [pads]);

	useEffect(() => {
		if (suppressClickRef.current.length !== pads.length) {
			suppressClickRef.current = Array.from(
				{ length: pads.length },
				(_, index) => suppressClickRef.current[index] ?? false
			);
		}
	}, [pads.length]);

	const setActiveRecorderPad = useCallback((index: number | null) => {
		activeRecorderPadRef.current = index;
		setRecordingPadIndex(index);
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
		recordingStartRef.current = null;
		shortPlaybackIndexRef.current = null;
		setIsSamplerRecording(false);
		setActiveRecorderPad(null);
	}, [setActiveRecorderPad]);

	const finalizePadRecording = useCallback(
		async (index: number, blob: Blob) => {
			if (!blob || blob.size === 0) {
				setSamplerPad(index, () => ({
					status: 'error',
					buffer: null,
					blob: null,
					error: '音声を取得できませんでした',
					updatedAt: Date.now(),
				}));
				return;
			}

			try {
				await engine.ensureStarted();
				const ctx = engine.audioContext;
				if (!ctx) {
					throw new Error('AudioContext の初期化に失敗しました');
				}
				const arrayBuffer = await blob.arrayBuffer();
				const decoded = await new Promise<AudioBuffer>((resolve, reject) => {
					ctx.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
				});

				const trimmed = trimEnabled
					? trimAudioBuffer(decoded)
					: { buffer: decoded, trimmed: false, removedSamples: 0 };
				let finalBlob = blob;
				try {
					finalBlob = audioBufferToWavBlob(trimmed.buffer);
				} catch {
					finalBlob = blob;
				}

				setSamplerPad(index, () => ({
					status: 'ready',
					buffer: trimmed.buffer,
					blob: finalBlob,
					error: undefined,
					updatedAt: Date.now(),
				}));
			} catch (error) {
				console.error('[sampler] finalize error', error);
				setSamplerPad(index, () => ({
					status: 'error',
					buffer: null,
					blob: null,
					error: error instanceof Error ? error.message : '録音した音声を処理できませんでした',
					updatedAt: Date.now(),
				}));
			}
		},
		[engine, setSamplerPad, trimEnabled]
	);

	const stopPadRecording = useCallback(() => {
		const recorder = recorderRef.current;
		if (!recorder || recorder.state === 'inactive') return;
		try {
			recorder.stop();
		} catch (error) {
			console.warn('[sampler] failed to stop recorder', error);
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
					throw new Error('AudioContext の初期化に失敗しました');
				}
				const source = ctx.createBufferSource();
				source.buffer = pad.buffer;
				setLastPlayedBuffer(pad.buffer);
				setLastPlayedPadIndex(index);
				setLastPlayedPadSeq((prev) => prev + 1);
				if (progressRafRef.current != null) {
					cancelAnimationFrame(progressRafRef.current);
					progressRafRef.current = null;
				}
				const durationMs = Math.max(1, pad.buffer.duration * 1000);
				const startedAt = performance.now();
				const tick = () => {
					const elapsed = performance.now() - startedAt;
					const ratio = elapsed / durationMs;
					if (ratio >= 1) {
						setPlaybackProgress(null);
						progressRafRef.current = null;
						return;
					}
					setPlaybackProgress(ratio);
					progressRafRef.current = requestAnimationFrame(tick);
				};
				setPlaybackProgress(0);
				progressRafRef.current = requestAnimationFrame(tick);
				const destination = engine.getChannelInput('sampler');
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
				console.error('[sampler] playback error', error);
				setSamplerPad(index, (prev) => ({
					...prev,
					error: error instanceof Error ? error.message : '再生に失敗しました',
				}));
			}
		},
		[engine, pads, setSamplerPad]
	);

	const handlePotentialShortPress = useCallback((index: number) => {
		const startedAt = recordingStartRef.current;
		if (startedAt == null) {
			return;
		}
		const duration = performance.now() - startedAt;
		if (duration < SHORT_PRESS_MS) {
			skipFinalizeRef.current = true;
			const pad = padsRef.current[index];
			if (pad?.buffer) {
				shortPlaybackIndexRef.current = index;
			}
		}
	}, []);

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
					throw new Error('このブラウザでは録音機能が利用できません');
				}

				await engine.ensureStarted();
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: { channelCount: 1 },
				});
				recorderStreamRef.current = stream;

				const selectedType =
					typeof MediaRecorder !== 'undefined' &&
					typeof MediaRecorder.isTypeSupported === 'function'
						? PREFERRED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type))
						: undefined;

				const recorder = selectedType
					? new MediaRecorder(stream, { mimeType: selectedType })
					: new MediaRecorder(stream);

				recorderRef.current = recorder;
				setActiveRecorderPad(index);
				setSamplerPad(index, (prev) => ({
					...prev,
					status: 'recording',
					error: undefined,
				}));
				recordingStartRef.current = performance.now();
				shortPlaybackIndexRef.current = null;

				recorder.ondataavailable = (event) => {
					if (event.data && event.data.size > 0) {
						recorderChunksRef.current.push(event.data);
					}
				};

				recorder.onerror = (event) => {
					console.error('[sampler] recorder error', event.error);
					skipFinalizeRef.current = true;
					setSamplerPad(index, () => ({
						status: 'error',
						buffer: null,
						blob: null,
						error: event.error?.message ?? '録音に失敗しました',
						updatedAt: Date.now(),
					}));
					try {
						recorder.stop();
					} catch {
						cleanupRecorder();
					}
				};

				recorder.onstop = () => {
					const mimeType = recorder.mimeType || selectedType || '';
					const blob =
						mimeType && recorderChunksRef.current.length
							? new Blob(recorderChunksRef.current, { type: mimeType })
							: new Blob(recorderChunksRef.current);
					recorderChunksRef.current = [];

					if (skipFinalizeRef.current) {
						skipFinalizeRef.current = false;
						cleanupRecorder();
						setSamplerPad(index, (prev) => ({
							...prev,
							status: prev.buffer ? 'ready' : 'empty',
						}));
						const playbackIndex = shortPlaybackIndexRef.current;
						shortPlaybackIndexRef.current = null;
						if (typeof playbackIndex === 'number') {
							void playPad(playbackIndex);
						}
						return;
					}

					finalizePadRecording(index, blob)
						.catch((error) => {
							console.error('[sampler] finalize error', error);
							setSamplerPad(index, () => ({
								status: 'error',
								buffer: null,
								blob: null,
								error: error instanceof Error ? error.message : '録音データの処理に失敗しました',
								updatedAt: Date.now(),
							}));
						})
						.finally(() => {
							cleanupRecorder();
						});
				};

				recorder.start(100);
				console.log('録音中');
			} catch (error) {
				console.error('[sampler] failed to start recording', error);
				skipFinalizeRef.current = false;
				setSamplerPad(index, () => ({
					status: 'error',
					buffer: null,
					blob: null,
					error: error instanceof Error ? error.message : '録音に失敗しました',
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
			if (SIMPLE_TOGGLE_MODE || samplerRecordingRef.current) {
				return;
			}

			const pad = padsRef.current[index];
			if (pad?.status !== 'ready') {
				suppressClickRef.current[index] = true;
				recordingStartRef.current = performance.now();
				shortPlaybackIndexRef.current = null;
				void startPadRecording(index);
			}
		},
		[startPadRecording]
	);

	const handlePadPointerUp = useCallback(
		(index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
			event.preventDefault();
			if (!SIMPLE_TOGGLE_MODE && activeRecorderPadRef.current === index) {
				const startedAt = recordingStartRef.current;
				if (startedAt == null) {
					const pad = padsRef.current[index];
					if (pad?.status === 'ready' && pad.buffer) {
						void playPad(index);
					}
					return;
				}
				handlePotentialShortPress(index);
				stopPadRecording();
			}
			try {
				event.currentTarget.releasePointerCapture(event.pointerId);
			} catch {
				/* ignore */
			}
		},
		[handlePotentialShortPress, stopPadRecording]
	);

	const handlePadPointerLeave = useCallback(
		(index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
			const element = event.currentTarget as HTMLButtonElement;
			const hasCapture =
				typeof element.hasPointerCapture === 'function' &&
				element.hasPointerCapture(event.pointerId);
			if (!hasCapture) return;

			if (!SIMPLE_TOGGLE_MODE && activeRecorderPadRef.current === index) {
				handlePotentialShortPress(index);
				stopPadRecording();
			}
			try {
				element.releasePointerCapture(event.pointerId);
			} catch {
				/* ignore */
			}
		},
		[handlePotentialShortPress, stopPadRecording]
	);

	const handlePadPointerCancel = useCallback(
		(index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
			if (!SIMPLE_TOGGLE_MODE && activeRecorderPadRef.current === index) {
				handlePotentialShortPress(index);
				stopPadRecording();
			}
			try {
				event.currentTarget.releasePointerCapture(event.pointerId);
			} catch {
				/* ignore */
			}
		},
		[handlePotentialShortPress, stopPadRecording]
	);

	const handlePadClick = useCallback(
		(index: number) => () => {
			if (SIMPLE_TOGGLE_MODE) {
				const activeIndex = activeRecorderPadRef.current;
				const recorder = recorderRef.current;
				if (activeIndex === index && recorder && recorder.state === 'recording') {
					stopPadRecording();
					return;
				}
				if (samplerRecordingRef.current) return;
				const pad = padsRef.current[index];
				if (pad?.status === 'ready' && pad.buffer) {
					void playPad(index);
					return;
				}
				void startPadRecording(index);
				return;
			}

			if (samplerRecordingRef.current) return;
			const pad = padsRef.current[index];
			if (pad?.status !== 'ready' || !pad.buffer) return;
			void playPad(index);
		},
		[playPad, startPadRecording, stopPadRecording]
	);

	// キーボード 1-9 -> Pad1-9, 0 -> Pad10 の再生
	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			if (target) {
				const tag = target.tagName;
				if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;
			}
			const key = event.key;
			let index: number | null = null;
			if (key >= '1' && key <= '9') {
				index = Number(key) - 1;
			} else if (key === '0') {
				index = 9;
			}
			if (index == null) return;
			void playPad(index);
		};
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	}, [playPad]);

	// クリーンアップ: コンポーネントアンマウント時に録音を停止・リソース解放
	useEffect(() => {
		return () => {
			suppressClickRef.current.fill(false);
			const activeIndex = activeRecorderPadRef.current;
			const padBeforeCleanup =
				typeof activeIndex === 'number' ? padsRef.current[activeIndex] : undefined;
			skipFinalizeRef.current = true;
			if (recorderRef.current && recorderRef.current.state !== 'inactive') {
				try {
					recorderRef.current.stop();
				} catch {
					cleanupRecorder();
				}
			} else {
				cleanupRecorder();
			}
			if (typeof activeIndex === 'number' && padBeforeCleanup) {
				setSamplerPad(activeIndex, (prev) => ({
					...prev,
					status: prev.buffer ? 'ready' : 'empty',
				}));
			}
		};
	}, [cleanupRecorder, setSamplerPad]);

	const formatDuration = useCallback((duration: number | undefined) => {
		if (!duration || !Number.isFinite(duration)) return '';
		if (duration >= 1) return `${duration.toFixed(1)}s`;
		return `${Math.round(duration * 1000)}ms`;
	}, []);

	const getPadHint = useCallback((pad: SamplerPad): string => {
		if (pad.status === 'recording') {
			return SIMPLE_TOGGLE_MODE ? 'Tap to stop' : 'Now recording...';
		}
		if (pad.status === 'ready') {
			return SIMPLE_TOGGLE_MODE ? 'Tap to play' : 'Tap to play';
		}
		if (pad.status === 'error') {
			return SIMPLE_TOGGLE_MODE ? 'Tap to retry' : 'Tap to retry';
		}
		return SIMPLE_TOGGLE_MODE ? 'Tap to record' : 'Hold to record';
	}, []);

	const getPadMeta = useCallback(
		(pad: SamplerPad): string | undefined => {
			if (pad.status === 'recording') return 'Release to stop';
			if (pad.status === 'ready' && pad.buffer) {
				return formatDuration(pad.buffer.duration);
			}
			if (pad.status === 'error') return pad.error;
			if (pad.updatedAt) {
				return new Date(pad.updatedAt).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
				});
			}
			return undefined;
		},
		[formatDuration]
	);

	return useMemo(
		() => ({
			pads,
			isSamplerRecording,
			recordingPadIndex,
			trimEnabled,
			setTrimEnabled,
			lastPlayedBuffer,
			playbackProgress,
			lastPlayedPadIndex,
			lastPlayedPadSeq,
			clearPadAt: resetPad,
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
			trimEnabled,
			setTrimEnabled,
			handlePadPointerDown,
			handlePadPointerUp,
			handlePadPointerLeave,
			handlePadPointerCancel,
			handlePadClick,
			getPadHint,
			getPadMeta,
			lastPlayedBuffer,
			playbackProgress,
			lastPlayedPadIndex,
			lastPlayedPadSeq,
			resetPad,
		]
	);
};
