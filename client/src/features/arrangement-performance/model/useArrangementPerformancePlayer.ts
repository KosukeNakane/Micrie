// [Model] features/model - useArrangementPerformancePlayer.ts
// 役割: アレンジメントスロットの連続再生を既存プレイヤー経由で制御
import { useCallback, useRef } from 'react';
import * as Tone from 'tone';

import { GlobalAudioEngine } from '@/entities/audio';
import { useChordsPlayer } from '@/features/playback/model/useChordsPlayer';
import { useDrumPlayer } from '@/features/playback/model/useDrumPlayer';
import { useMelodyPlayer } from '@/features/playback/model/useMelodyPlayer';

import type { ArrangementPlaybackTimeline } from './arrangementPlaybackBuilder';

const ensureToneContextSync = async (ctx: AudioContext) => {
	const current = Tone.getContext();
	if (current.rawContext !== ctx) {
		const toneCtx = new Tone.Context({ context: ctx as any });
		Tone.setContext(toneCtx);
	}
	try {
		if ((Tone.getContext() as any).state !== 'running') {
			await Tone.start();
		}
	} catch {
		/* ignore */
	}
};

export type ArrangementPlaybackItem = {
	slotIndex: number;
	timeline: ArrangementPlaybackTimeline;
};

export type ArrangementPerformanceCallbacks = {
	onSegmentStart?: (slotIndex: number) => void;
	onSegmentComplete?: (slotIndex: number, isLast: boolean) => void;
	onAllComplete?: () => void;
};

export type ArrangementPerformanceOptions = {
	loop?: boolean;
};

export const useArrangementPerformancePlayer = () => {
	const { playMelody } = useMelodyPlayer();
	const { playChordAt, chordToNotes } = useChordsPlayer();
	const { playDrumHit } = useDrumPlayer();

	const scheduledEventIdsRef = useRef<number[]>([]);

	const cleanup = useCallback(() => {
		const transport = Tone.getTransport();
		scheduledEventIdsRef.current.forEach((id) => transport.clear(id));
		scheduledEventIdsRef.current = [];
	}, []);

	const playArrangement = useCallback(
		async (
			items: ArrangementPlaybackItem[],
			callbacks: ArrangementPerformanceCallbacks,
			options?: ArrangementPerformanceOptions
		) => {
			cleanup();
			if (!items.length) return;

			const engine = GlobalAudioEngine.instance;
			await engine.ensureStarted();
			await engine.setMasterMuted(false);
			const ctx = engine.audioContext;
			if (!ctx) return;
			await ensureToneContextSync(ctx);

			const transport = Tone.getTransport();
			transport.loop = false;
			transport.stop();
			transport.position = 0;
			transport.start();

			const lookAhead = 0.05;
			let offset = 0;
			const totalDuration = items.reduce((sum, item) => sum + item.timeline.length, 0);
			const loopInterval = options?.loop && totalDuration > 0 ? totalDuration : null;

			const schedule = (secondsFromNow: number, handler: (time: number) => void) => {
				const normalized = Math.max(secondsFromNow + lookAhead, 0);
				const id = loopInterval
					? transport.scheduleRepeat(handler, loopInterval, normalized)
					: transport.scheduleOnce(handler, `+${normalized}`);
				scheduledEventIdsRef.current.push(id);
			};

			items.forEach((item, idx) => {
				const segmentStartOffset = offset;
				schedule(segmentStartOffset, () => {
					callbacks.onSegmentStart?.(item.slotIndex);
				});

				item.timeline.events.forEach((event) => {
					const eventOffset = segmentStartOffset + event.start;
					schedule(eventOffset, (scheduledTime) => {
						if (event.type === 'melody') {
							playMelody(event.note, scheduledTime, event.duration);
						} else if (event.type === 'drum') {
							playDrumHit(event.label, scheduledTime);
						} else if (event.type === 'chord') {
							const chordData = event.chord ?? { rootIndex: 0, quality: 'maj', tension: '' };
							const allNotes = chordToNotes(
								chordData.rootIndex,
								chordData.quality,
								chordData.tension
							);
							const notesToPlay = event.playType === 'root' ? allNotes.slice(0, 1) : allNotes;
							const shiftedNotes = notesToPlay.map((n) => {
								try {
									const midi = Tone.Frequency(n).toMidi();
									return Tone.Frequency(midi + 12, 'midi').toNote();
								} catch {
									return n;
								}
							});
							playChordAt(shiftedNotes, scheduledTime, event.duration);
						}
					});
				});

				const segmentEndOffset = segmentStartOffset + item.timeline.length + 0.01;
				schedule(segmentEndOffset, () => {
					const isLast = idx === items.length - 1;
					callbacks.onSegmentComplete?.(item.slotIndex, isLast);
					if (!loopInterval && isLast) {
						callbacks.onAllComplete?.();
					}
				});

				offset += item.timeline.length;
			});
		},
		[cleanup, chordToNotes, playChordAt, playDrumHit, playMelody]
	);

	const stopAll = useCallback(() => {
		cleanup();
		try {
			Tone.getTransport().stop();
			Tone.getTransport().position = 0;
		} catch {}
	}, [cleanup]);

	return {
		playArrangement,
		stopAll,
	} as const;
};
