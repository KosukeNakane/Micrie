// [App] app - App.tsx
// 役割: アプリ全体のセットアップ/プロバイダ
// Micrie アプリのルートコンポーネント。
// 各種コンテキストプロバイダーで状態を共有しつつ、AppContentを表示する。
/** @jsxImportSource @emotion/react */
import { createSystem, defineConfig, defaultConfig, ChakraProvider } from '@chakra-ui/react';
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';

import { Providers } from '@app/providers/Providers';
import { AppRouter } from '@app/routes/AppRouter';
import { Sidebar } from '@widgets/sidebar';

import { Scaler, useScaler } from '@/app/providers/Scaler';
import { GlobalAudioEngine, useChannelsStore } from '@/entities/audio';
import { useBarCount } from '@/entities/bar-count';
import { useArrangementStore } from '@/entities/pattern/model/arrangementStore';
import { usePatternEditor } from '@/entities/pattern/model/usePatternEditor';
import { useEditingPatternStore } from '@/entities/pattern/model/editingPatternStore';
import {
	useSavedPatternStore,
	type SavedPatternSlot,
} from '@/entities/pattern/model/savedPatternStore';
import type { Pattern, Segment, ChordSlot, PlayType } from '@/types/pattern';
import { useEffects } from '@/entities/effects';
import { useChordPattern, useDrumPattern } from '@/entities/pattern';
import { useScaleMode } from '@/entities/scale-mode';
import { useSegment } from '@/entities/segment';
import { useTempo } from '@/entities/tempo';
import { useVolume } from '@/entities/volume';
import { openLoginModal } from '@/features/auth';
import { useEffectsUiStore } from '@/features/effects';
import { usePlaybackController } from '@/features/playback';
import { SaveProjectModal, useSaveProject } from '@/features/project-save-load';
import {
	OpenProjectModal,
	ensureAuth,
	listProjects,
	loadProject,
	downloadLocalProject,
	useAssembleProjectData,
	useProjectState,
	getInitialProjectData,
} from '@/features/project-save-load';

// useProjectState は上記のバレルから取得
import { stableStringify } from '@/shared/lib/stableStringify';
import { PRESETS } from '@/shared/lib/chord-presets';
import { NavBar } from '@/shared/ui';
import { ConfirmUnsavedChangesModal } from '@/shared/ui/ConfirmUnsavedChangesModal';
// getInitialProjectData は上記のバレルから取得
import { LoginRequiredModal } from '@/shared/ui/LoginRequiredModal';
import { ToasterHost } from '@/shared/ui/toaster';
import { PATTERNS as DRUM_PATTERNS } from '@/features/drums-playback/lib/patterns';
import type { ProjectArrangementPattern, ProjectData, ProjectSegment } from '@/entities/project';
import {
	normalizePlayType,
	normalizeQuality,
	normalizeRootIndex,
	normalizeTension,
} from '@/utils/normalizers';

const config = defineConfig({
	globalCss: {
		'html, body': {
			bg: 'gray.100',
			color: 'gray.800',
		},
	},
});
const system = createSystem(defaultConfig, config);

const STEP_BEAT = 0.5;

const cloneSegments = (segments: Array<Segment | ProjectSegment> | undefined | null): Segment[] =>
	Array.isArray(segments)
		? segments.map((seg) => ({
				...(seg as Segment),
				label: typeof seg.label === 'string' ? seg.label : '',
		  }))
		: [];

const createChordSlotsFromPreset = (
	bars: number,
	chordsPerBar: number,
	presetId: string
): ChordSlot[] => {
	const preset = PRESETS[presetId] ?? PRESETS.pattern1;
	const total = Math.max(1, bars * chordsPerBar);
	return Array.from({ length: total }, (_, index) => {
		const source = preset[index % preset.length];
		const plays: [PlayType, PlayType] = [
			(source.plays?.[0] as PlayType) ?? 'root',
			(source.plays?.[1] as PlayType) ?? 'chord',
		];
		return {
			chord: { ...source.chord },
			plays,
		};
	});
};

const createRhythmSegmentsFromPattern = (patternKey: keyof typeof DRUM_PATTERNS): Segment[] => {
	const pattern = DRUM_PATTERNS[patternKey] ?? DRUM_PATTERNS.basic;
	const segments: Segment[] = Array.from({ length: 16 }, (_, i) => ({
		label: '',
		start: i * STEP_BEAT,
		end: (i + 1) * STEP_BEAT,
	}));
	pattern.forEach((event) => {
		const index = Math.round(event.time / STEP_BEAT);
		if (index >= 0 && index < segments.length) {
			segments[index] = { ...segments[index], label: event.type };
		}
	});
	return segments;
};

const createPatternFromLegacyProgression = (
	data: ProjectData
): { pattern: Pattern; name: string } | null => {
	const progression = data.chordsProgression;
	if (
		!progression ||
		typeof progression.bars !== 'number' ||
		typeof progression.chordsPerBar !== 'number'
	) {
		return null;
	}
	const bars = Math.max(1, Math.floor(progression.bars));
	const chordsPerBar = Math.max(1, Math.floor(progression.chordsPerBar));
	const total = Math.max(1, bars * chordsPerBar);
	const slots = Array.isArray(progression.slots) ? progression.slots : [];
	const chordSlots: ChordSlot[] = Array.from({ length: total }, (_, idx) => {
		const src = slots[idx] ?? {};
		const chord = src?.chord ?? {};
		const plays = Array.isArray(src?.plays) ? src.plays : [];
		return {
			chord: {
				rootIndex: normalizeRootIndex(chord.rootIndex),
				quality: normalizeQuality(chord.quality),
				tension: normalizeTension(chord.tension),
			},
			plays: [normalizePlayType(plays[0], 0), normalizePlayType(plays[1], 1)],
		};
	});
	const legacyId =
		typeof data.lastEditingPatternId === 'string'
			? data.lastEditingPatternId
			: 'chords-progression';
	const legacyName =
		typeof (data as any)?.meta?.name === 'string'
			? `${(data as any).meta.name} Progression`
			: 'Imported Progression';
	return {
		name: legacyName,
		pattern: {
			id: legacyId,
			bars,
			chordsPerBar,
			chordSlots,
			melodySegments: [],
			rhythmSegments: [],
		},
	};
};

// デフォルトパターンの作成(アプリ起動直後に、EditingPatternStoreに使用)
const makeDefaultPattern = (): Pattern => {
	const bars = 2;
	const chordsPerBar = 4;
	return {
		id: `default-${Date.now()}`,
		bars,
		chordsPerBar,
		chordSlots: createChordSlotsFromPreset(bars, chordsPerBar, 'pattern1'),
		melodySegments: [],
		rhythmSegments: createRhythmSegmentsFromPattern('basic'),
	};
};

const patternFromArrangement = (item: ProjectArrangementPattern, index: number): Pattern => ({
	id: typeof item.id === 'string' ? item.id : `arr-${index}`,
	bars: item.snapshot.chords.bars,
	chordsPerBar: item.snapshot.chords.chordsPerBar,
	chordSlots: item.snapshot.chords.slots.map((slot) => ({
		chord: { ...slot.chord },
		plays: [...slot.plays] as [PlayType, PlayType],
	})),
	melodySegments: cloneSegments(item.snapshot.melody.segments),
	rhythmSegments: cloneSegments(item.snapshot.rhythmSegments),
});

const extractPatternsFromArrangements = (data: ProjectData): SavedPatternSlot[] => {
	if (!Array.isArray(data.arrangements)) return [];
	return data.arrangements.reduce<SavedPatternSlot[]>((acc, item, index) => {
		if (!item) return acc;
		acc.push({
			name:
				typeof item.name === 'string' && item.name.trim().length > 0
					? item.name
					: `Pattern ${index + 1}`,
			pattern: patternFromArrangement(item, index),
		});
		return acc;
	}, []);
};

type SerializedSavedPattern = NonNullable<ProjectData['savedPatterns']>[number];

const patternFromSavedEntry = (entry: SerializedSavedPattern, index: number): Pattern | null => {
	if (!entry) return null;
	if (
		typeof entry.bars !== 'number' ||
		typeof entry.chordsPerBar !== 'number' ||
		!Array.isArray(entry.chordSlots)
	) {
		return null;
	}
	return {
		id: typeof entry.id === 'string' ? entry.id : `saved-${index}`,
		bars: entry.bars,
		chordsPerBar: entry.chordsPerBar,
		chordSlots: entry.chordSlots.map((slot) => ({
			chord: { ...slot.chord },
			plays: [...slot.plays] as [PlayType, PlayType],
		})),
		melodySegments: cloneSegments(entry.melodySegments),
		rhythmSegments: cloneSegments(entry.rhythmSegments),
	};
};

const slotNameFrom = (value: unknown, index: number) =>
	typeof value === 'string' && value.trim().length > 0 ? value : `Pattern ${index + 1}`;

const convertSavedPatterns = (data: ProjectData): SavedPatternSlot[] | null => {
	if (!Array.isArray(data.savedPatterns)) return null;
	const mapped: SavedPatternSlot[] = data.savedPatterns.map((entry, index) => {
		if (!entry) {
			return { name: slotNameFrom(null, index), pattern: null };
		}
		return {
			name: slotNameFrom(entry.name, index),
			pattern: patternFromSavedEntry(entry, index),
		};
	});
	return mapped.some((slot) => Boolean(slot.pattern)) ? mapped : null;
};

const applyEditingPatternFromProjectData = (data: ProjectData) => {
	const savedStore = useSavedPatternStore.getState();
	const editingStore = useEditingPatternStore.getState();
	const savedList = convertSavedPatterns(data);
	let availablePatterns: Pattern[] = [];
	if (savedList) {
		savedStore.setSlots(savedList);
		availablePatterns = savedList
			.map((slot) => slot.pattern)
			.filter((p): p is Pattern => Boolean(p));
	} else {
		const arrPatterns = extractPatternsFromArrangements(data);
		if (arrPatterns.length > 0) {
			savedStore.setSlots(arrPatterns);
			availablePatterns = arrPatterns
				.map((slot) => slot.pattern)
				.filter((p): p is Pattern => Boolean(p));
		} else {
			const legacyPattern = createPatternFromLegacyProgression(data);
			if (legacyPattern) {
				savedStore.setSlots([{ name: legacyPattern.name, pattern: legacyPattern.pattern }]);
				availablePatterns = [legacyPattern.pattern];
			} else {
				savedStore.resetPatterns();
			}
		}
	}
	const lastId = typeof data.lastEditingPatternId === 'string' ? data.lastEditingPatternId : null;
	let targetPattern: Pattern | null = null;
	if (lastId) {
		targetPattern = availablePatterns.find((p) => p.id === lastId) ?? null;
	}
	if (!targetPattern) {
		targetPattern = availablePatterns[0] ?? makeDefaultPattern();
	}
	editingStore.resetPattern();
	editingStore.loadPattern(targetPattern);
};

export const App = () => {
	useEffect(() => {
		const saved = useSavedPatternStore.getState().patterns;
		const hasAnySaved = saved.some((slot) => Boolean(slot.pattern));
		const editingPattern = useEditingPatternStore.getState().pattern;
		if (hasAnySaved || editingPattern) return;
		const pattern = makeDefaultPattern();
		useEditingPatternStore.getState().loadPattern(pattern);
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const engine = GlobalAudioEngine.instance;
		const warmup = async (_event?: Event) => {
			try {
				await engine.unlock();
			} catch (error) {
				if (import.meta.env.DEV) console.warn('Audio warmup failed', error);
			}
		};

		// 可能であれば初回マウント時点でウォームアップを試みる
		warmup();

		const options: AddEventListenerOptions = { once: true };
		window.addEventListener('pointerdown', warmup, options);
		window.addEventListener('keydown', warmup, options);
		window.addEventListener('touchend', warmup, options);

		return () => {
			window.removeEventListener('pointerdown', warmup);
			window.removeEventListener('keydown', warmup);
			window.removeEventListener('touchend', warmup);
		};
	}, []);

	const AppInner = () => {
		const { save, saveAs } = useSaveProject();
		const [saveModalOpen, setSaveModalOpen] = useState<null | { mode: 'new' | 'as' }>(null);
		const [openModal, setOpenModal] = useState(false);
		const [confirmUnsavedOpen, setConfirmUnsavedOpen] = useState(false);
		const [openAfterSave, setOpenAfterSave] = useState(false);
		const [newAfterSave, setNewAfterSave] = useState(false);
		const [confirmForNew, setConfirmForNew] = useState(false);
		const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);
		const { loopPlay, stop, isLoopPlaying } = usePlaybackController();
		const { setTempo } = useTempo();
		const { setMany: setEffects, reset: resetEffects } = useEffects();
		const setHold = useEffectsUiStore((s) => s.setHold);
		const setHoldFor = useEffectsUiStore((s) => s.setHoldFor);
		const setMuted = useChannelsStore((s) => s.setMuted);
		const setChannelVolume = useChannelsStore((s) => s.setVolume);
		const { setContextAudioBuffer } = useSegment();
		const { setMelodySegments } = usePatternEditor();
		const setArrangementSlot = useArrangementStore((s) => s.setSlot);
		const resetArrangementSlots = useArrangementStore((s) => s.resetArrangement);
		const { barCount } = useBarCount();
		const assemble = useAssembleProjectData();
		const project = useProjectState();
		const { setVolume } = useVolume();
		const { setScaleMode } = useScaleMode();
		const { setChordPattern } = useChordPattern();
		const { setDrumPattern } = useDrumPattern();

		useEffect(() => {
			const handleSpace = (event: KeyboardEvent) => {
				if (event.code !== 'Space' && event.key !== ' ') return;

				const target = event.target as HTMLElement | null;
				if (target) {
					const tag = target.tagName;
					if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {
						return;
					}
				}

				event.preventDefault();
				if (isLoopPlaying) {
					stop();
				} else {
					void loopPlay();
				}
			};

			window.addEventListener('keydown', handleSpace);
			return () => window.removeEventListener('keydown', handleSpace);
		}, [isLoopPlaying, loopPlay, stop]);

		const handleSaveProject = async () => {
			try {
				await save(); // 既存IDがあれば上書き保存、無ければ NAME_REQUIRED を投げる
			} catch (e: any) {
				if (String(e?.message) === 'NAME_REQUIRED') {
					// 新規（IDなし）の場合は名前を付けて保存モーダルを開く
					setSaveModalOpen({ mode: 'as' });
					return;
				}
				if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
					setLoginRequiredOpen(true);
					return;
				}
				throw e;
			}
		};

		const handleSaveProjectAs = async () => {
			try {
				await ensureAuth();
			} catch (e: any) {
				if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
					setLoginRequiredOpen(true);
					return;
				}
				throw e;
			}
			setSaveModalOpen({ mode: 'as' });
		};

		const handleOpenProject = async () => {
			if (import.meta.env.DEV) console.log('[open] UI: open modal');
			try {
				await ensureAuth();
			} catch (e: any) {
				if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
					setLoginRequiredOpen(true);
					return;
				}
				throw e;
			}
			// 未保存変更チェック: 一度も保存していない場合（lastHashがnull）も確認を出す
			try {
				const currentHash = stableStringify(assemble() as any);
				const lastHash = useProjectState.getState().lastSavedHash;
				const initialHash = stableStringify(getInitialProjectData() as any);
				const needConfirm = lastHash ? currentHash !== lastHash : currentHash !== initialHash;
				if (needConfirm) {
					setConfirmForNew(false);
					setConfirmUnsavedOpen(true);
					return;
				}
			} catch {}
			setOpenModal(true);
		};

		const resetToInitialProject = () => {
			project.clear();
			project.setProject(null, 'Untitled');
			project.setLastSavedHash(null);
			try {
				setTempo(90);
			} catch {}
			try {
				setVolume(100);
			} catch {}
			try {
				resetEffects();
			} catch {}
			try {
				setScaleMode('major' as any);
			} catch {}
			try {
				setChordPattern('pattern1' as any);
			} catch {}
			try {
				setDrumPattern('basic' as any);
			} catch {}
			try {
				resetArrangementSlots();
			} catch {}
			try {
				setHold(false);
			} catch {}
			try {
				setMuted('melody', false);
				setMuted('chord', false);
				setMuted('drum', false);
				setMuted('sampler', false);
			} catch {}
			try {
				setChannelVolume('melody', 100);
				setChannelVolume('chord', 100);
				setChannelVolume('drum', 100);
				setChannelVolume('sampler', 100);
			} catch {}
		};

		const handleNewProject = () => {
			// Confirm only when there are changes (ignore untouched initial state)
			try {
				const currentHash = stableStringify(assemble() as any);
				const lastHash = useProjectState.getState().lastSavedHash;
				const initialHash = stableStringify(getInitialProjectData() as any);
				const needConfirm = lastHash ? currentHash !== lastHash : currentHash !== initialHash;
				if (needConfirm) {
					setConfirmForNew(true);
					setConfirmUnsavedOpen(true);
					return;
				}
			} catch {}
			// No changes -> reset immediately
			resetToInitialProject();
		};

		const fetchProjectItems = async () => {
			const t0 = performance.now();
			if (import.meta.env.DEV) console.log('[open] list: start');
			let uid: string;
			try {
				uid = await ensureAuth();
			} catch (e: any) {
				if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
					setLoginRequiredOpen(true);
					return [] as any[];
				}
				throw e;
			}
			const items = await listProjects(uid);
			if (import.meta.env.DEV)
				console.log('[open] list: done', {
					count: items.length,
					elapsedMs: Math.round(performance.now() - t0),
				});
			return items;
		};

		const onSelectProject = async (id: string) => {
			const t0 = performance.now();
			if (import.meta.env.DEV) console.log('[open] load: start', { id });
			try {
				let uid: string;
				try {
					uid = await ensureAuth();
				} catch (e: any) {
					if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
						setLoginRequiredOpen(true);
						return;
					}
					throw e;
				}
				const doc = await loadProject(uid, id);
				if (!doc) return;
				// プロジェクト名とIDをステートに反映
				try {
					const name = (doc as any)?.meta?.name ?? id;
					project.setProject(id, String(name));
					try {
						project.setLastSavedHash(stableStringify((doc as any).data));
					} catch {}
				} catch {}
				const d = doc.data;
				if (typeof d.tempo === 'number') setTempo(d.tempo);
				if (d.chordPattern) setChordPattern(d.chordPattern as any);
				if (d.drumPattern) setDrumPattern(d.drumPattern as any);
				if (Array.isArray(d.arrangementSlots)) {
					try {
						resetArrangementSlots();
						d.arrangementSlots.forEach((slotId, idx) => {
							if (typeof slotId === 'string') {
								setArrangementSlot(idx, slotId);
							}
						});
					} catch {}
				} else {
					try {
						resetArrangementSlots();
					} catch {}
				}
				if (d.effects) setEffects(d.effects as any);
				if (d.effectsHold) {
					setHold(!!d.effectsHold.holdAll);
					const by = d.effectsHold.holdByKey || {};
					for (const [k, v] of Object.entries(by)) setHoldFor(k as any, !!v);
				}
				// Melody segments from saved pitch data (melodyPitch)
				try {
					const mp = Array.isArray(d.melodyPitch) ? (d.melodyPitch as any[]) : [];
					if (mp.length > 0) {
						const tempoForCalc = typeof d.tempo === 'number' ? d.tempo : 120;
						const bars = barCount && Number.isFinite(barCount) ? barCount : 2;
						const totalDuration = (60 / (tempoForCalc || 120)) * 4 * bars;
						const chunk = totalDuration / mp.length;
						const segments = mp.map((it, i) => ({
							note: (typeof it?.note === 'string' ? it.note : 'rest') as string,
							label: ((typeof it?.note === 'string' ? it.note : 'rest') === 'rest'
								? '—'
								: String(it?.note)) as string,
							start: i * chunk,
							end: (i + 1) * chunk,
						}));
						setMelodySegments(segments as any);
					}
				} catch {}
				if (d.channelsMuted) {
					setMuted('melody', !!d.channelsMuted.melody);
					setMuted('chord', !!d.channelsMuted.chord);
					setMuted('drum', !!d.channelsMuted.drum);
					setMuted('sampler', !!d.channelsMuted.sampler);
				}
				if (d.volume) {
					if (typeof d.volume.master === 'number') {
						try {
							setVolume(d.volume.master);
						} catch {}
					}
					if (typeof d.volume.melody === 'number') {
						try {
							setChannelVolume('melody', d.volume.melody);
						} catch {}
					}
					if (typeof d.volume.chord === 'number') {
						try {
							setChannelVolume('chord', d.volume.chord);
						} catch {}
					}
					if (typeof d.volume.drum === 'number') {
						try {
							setChannelVolume('drum', d.volume.drum);
						} catch {}
					}
					if (typeof d.volume.sampler === 'number') {
						try {
							setChannelVolume('sampler', d.volume.sampler);
						} catch {}
					}
				}
				try {
					applyEditingPatternFromProjectData(d as ProjectData);
				} catch {}
				// 保存形式1: StorageのURL（既存実装）
				if (d.audio?.audioUrl) {
					try {
						if (import.meta.env.DEV)
							console.log('[open] audio: fetching', { url: d.audio.audioUrl });
						const res = await fetch(d.audio.audioUrl);
						const ab = await res.arrayBuffer();
						const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
						const buf = await ctx.decodeAudioData(ab);
						setContextAudioBuffer('melody', buf);
						if (import.meta.env.DEV) console.log('[open] audio: decoded & set (url)');
					} catch (e) {
						console.warn('Audio load failed (url):', e);
					}
				} else if (d.audio) {
					// 保存形式2: Firestoreに配列として保存されたPCMなどを復元
					try {
						const AC = (window.AudioContext ||
							(window as any).webkitAudioContext) as typeof AudioContext;
						const ctx = new AC();

						const audio: any = d.audio;
						const sampleRate = Number(audio.sampleRate || 48000);

						let buffer: AudioBuffer | null = null;

						// ケースA: monoのFloat32 PCM配列（[-1,1]）: audio.samples: number[]
						if (Array.isArray(audio.samples) && audio.samples.length > 0) {
							const data = Float32Array.from(audio.samples as number[]);
							buffer = ctx.createBuffer(1, data.length, sampleRate);
							buffer.getChannelData(0).set(data);
						}

						// ケースB: channels: number[][] で複数chのPCM
						if (
							!buffer &&
							Array.isArray(audio.channels) &&
							audio.channels.length > 0 &&
							Array.isArray(audio.channels[0])
						) {
							const chs = audio.channels as number[][];
							const length = Math.max(1, Math.max(...chs.map((c) => c.length)));
							buffer = ctx.createBuffer(Math.max(1, chs.length), length, sampleRate);
							for (let ch = 0; ch < chs.length; ch++) {
								const arr = Float32Array.from(chs[ch]);
								buffer.getChannelData(ch).set(arr.subarray(0, length));
							}
						}

						// ケースC: base64でエンコードされたFloat32 PCM（mono）: float32Base64
						if (!buffer && typeof audio.float32Base64 === 'string' && audio.float32Base64) {
							const b64 = audio.float32Base64;
							const bin = atob(b64);
							const bytes = new Uint8Array(bin.length);
							for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
							const f32 = new Float32Array(bytes.buffer);
							buffer = ctx.createBuffer(1, f32.length, sampleRate);
							buffer.getChannelData(0).set(f32);
						}

						if (buffer) {
							setContextAudioBuffer('melody', buffer);
							if (import.meta.env.DEV) console.log('[open] audio: decoded & set (inline)');
						} else if (import.meta.env.DEV) {
							console.warn('[open] audio: no decodable inline format found');
						}
					} catch (e) {
						console.warn('Audio load failed (inline):', e);
					}
				}
				if (import.meta.env.DEV)
					console.log('[open] load: done', { elapsedMs: Math.round(performance.now() - t0) });
			} finally {
				setOpenModal(false);
			}
		};

		return (
			<>
				{/* 左側の固定サイドバー（Chakra/Providers コンテキスト内） */}
				<Sidebar
					onNewProject={handleNewProject}
					onOpenProject={handleOpenProject}
					onSaveProject={handleSaveProject}
					onSaveProjectAs={handleSaveProjectAs}
				/>

				{/* Save モーダル */}
				<SaveProjectModal
					isOpen={!!saveModalOpen}
					initialName={project.currentProjectName}
					onClose={() => setSaveModalOpen(null)}
					onSubmit={async ({ name, mode }) => {
						if (mode === 'cloud') {
							await saveAs(name);
							if (openAfterSave) {
								setOpenAfterSave(false);
								setOpenModal(true);
							}
							if (newAfterSave) {
								setNewAfterSave(false);
								resetToInitialProject();
							}
						} else {
							const data = assemble();
							downloadLocalProject(name, data);
							if (openAfterSave) {
								setOpenAfterSave(false);
								setOpenModal(true);
							}
							if (newAfterSave) {
								setNewAfterSave(false);
								resetToInitialProject();
							}
						}
					}}
				/>
				<OpenProjectModal
					isOpen={openModal}
					onClose={() => setOpenModal(false)}
					fetchItems={fetchProjectItems}
					onSelect={onSelectProject}
					onSelectLocal={async (doc) => {
						// プロジェクト名とIDをステートに反映（ローカルファイル）
						try {
							const meta = (doc as any).meta || {};
							const id = String(meta.id || 'local');
							const name = String(meta.name || 'Untitled');
							project.setProject(id, name);
						} catch {}
						const d = (doc as any).data || doc;
						try {
							project.setLastSavedHash(stableStringify(d));
						} catch {}
						if (typeof d.tempo === 'number') setTempo(d.tempo);
						if ((d as any).chordPattern) setChordPattern((d as any).chordPattern as any);
						if ((d as any).drumPattern) setDrumPattern((d as any).drumPattern as any);
						if (d.effects) setEffects(d.effects as any);
						if (d.effectsHold) {
							setHold(!!d.effectsHold.holdAll);
							const by = d.effectsHold.holdByKey || {};
							for (const [k, v] of Object.entries(by)) setHoldFor(k as any, !!v);
						}
						if (d.channelsMuted) {
							setMuted('melody', !!d.channelsMuted.melody);
							setMuted('chord', !!d.channelsMuted.chord);
							setMuted('drum', !!d.channelsMuted.drum);
							setMuted('sampler', !!d.channelsMuted.sampler);
						}
						if (d.volume) {
							if (typeof d.volume.master === 'number') {
								try {
									setVolume(d.volume.master);
								} catch {}
							}
							if (typeof d.volume.melody === 'number') {
								try {
									setChannelVolume('melody', d.volume.melody);
								} catch {}
							}
							if (typeof d.volume.chord === 'number') {
								try {
									setChannelVolume('chord', d.volume.chord);
								} catch {}
							}
							if (typeof d.volume.drum === 'number') {
								try {
									setChannelVolume('drum', d.volume.drum);
								} catch {}
							}
							if (typeof d.volume.sampler === 'number') {
								try {
									setChannelVolume('sampler', d.volume.sampler);
								} catch {}
							}
						}
						try {
							applyEditingPatternFromProjectData(d as ProjectData);
						} catch {}
						// Melody segments from saved pitch data (local)
						try {
							const mp = Array.isArray((d as any).melodyPitch)
								? ((d as any).melodyPitch as any[])
								: [];
							if (mp.length > 0) {
								const tempoForCalc = typeof (d as any).tempo === 'number' ? (d as any).tempo : 120;
								const bars = barCount && Number.isFinite(barCount) ? barCount : 2;
								const totalDuration = (60 / (tempoForCalc || 120)) * 4 * bars;
								const chunk = totalDuration / mp.length;
								const segments = mp.map((it, i) => ({
									note: (typeof it?.note === 'string' ? it.note : 'rest') as string,
									label: ((typeof it?.note === 'string' ? it.note : 'rest') === 'rest'
										? '—'
										: String(it?.note)) as string,
									start: i * chunk,
									end: (i + 1) * chunk,
								}));
								setMelodySegments(segments as any);
							}
						} catch {}
					}}
				/>

				{/* 未保存変更の確認 */}
				<ConfirmUnsavedChangesModal
					isOpen={confirmUnsavedOpen}
					projectName={project.currentProjectName}
					onCancel={() => setConfirmUnsavedOpen(false)}
					onDiscardAndContinue={() => {
						setConfirmUnsavedOpen(false);
						if (confirmForNew) {
							resetToInitialProject();
						} else {
							setOpenModal(true);
						}
						setConfirmForNew(false);
					}}
					onSaveAndContinue={async () => {
						try {
							await save();
							setConfirmUnsavedOpen(false);
							if (confirmForNew) {
								resetToInitialProject();
							} else {
								setOpenModal(true);
							}
							setConfirmForNew(false);
						} catch (e: any) {
							if (String(e?.message) === 'NAME_REQUIRED') {
								setConfirmUnsavedOpen(false);
								if (confirmForNew) setNewAfterSave(true);
								else setOpenAfterSave(true);
								setSaveModalOpen({ mode: 'as' });
								return;
							}
							if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
								setConfirmUnsavedOpen(false);
								setLoginRequiredOpen(true);
								return;
							}
							throw e;
						}
					}}
				/>

				{/* Login required modal */}
				<LoginRequiredModal
					isOpen={loginRequiredOpen}
					onClose={() => setLoginRequiredOpen(false)}
					onLogin={() => {
						setLoginRequiredOpen(false);
						openLoginModal();
					}}
				/>
			</>
		);
	};

	// アプリ全体のベーススタイル（背景ぼかし含むレイヤー構成）
	const appStyle = css`
		position: relative;
		min-height: 100vh;
		overflow: hidden;
	`;

	/* ぼかしフィルター付きの背景画像（常にビューポート全体をカバー） */
	const backgroundStyle = css`
		position: fixed;
		/* ブラーで端が透けないように少し拡大した領域を確保 */
		inset: -80px;
		/* ややグレーのトーンを重ねる */
		background-image: linear-gradient(rgba(0, 0, 0, 0.18), rgba(23, 92, 221, 0.453)),
			url(/background.jpg);
		background-size: cover; /* アスペクト比を保ったまま全面カバー */
		background-position: center; /* 中央寄せ */
		background-repeat: no-repeat;
		filter: blur(50px);
		z-index: 0;
		pointer-events: none;
	`;

	/* 背景の上に重ねるUIのコンテンツレイヤー */
	const contentStyle = css`
		position: relative;
		z-index: 1;
		/* 左サイドバーの幅分だけ右側にオフセット */
		padding-left: 0;
		/* タイトルバー撤去に伴い上余白を詰める */
		padding-top: 0;
	`;

	// NavBar の下余白をスケール追従 + レターボックス補正で算出
	const { scale } = useScaler();
	void scale;

	return (
		<div css={appStyle}>
			{/* 背景はスケール外で常にビューポートをカバー */}
			<div css={backgroundStyle} />
			<ChakraProvider value={system}>
				<Providers>
					{/* Sidebar はビューポート左端に固定したいので Scaler の外に配置 */}
					<AppInner />
					{/* Global toast host (Chakra v3 toaster) */}
					<ToasterHost />
					{/* スケール対象のアプリ本体 */}
					<Scaler>
						<div css={contentStyle}>
							{/* ルーティング等のメインコンテンツ */}
							<AppRouter />
							{/* 画面最下部のNavBar（スケール追従の下余白） */}
							<div
								style={{
									position: 'fixed',
									left: '50%',
									transform: 'translateX(calc(-50% - 12px))',
									bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
									zIndex: 5,
									pointerEvents: 'auto',
								}}
							>
								<NavBar />
							</div>
						</div>
					</Scaler>
				</Providers>
			</ChakraProvider>
		</div>
	);
};
