import { useState } from 'react';

import { useBarCount } from '@/entities/bar-count';
import { useChannelsStore } from '@/entities/audio';
import { useArrangementStore } from '@/entities/pattern/model/arrangementStore';
import { usePatternEditor } from '@/entities/pattern/model/usePatternEditor';
import { useSegment } from '@/entities/segment';
import type { ProjectData } from '@/entities/project';
import { useEffects } from '@/entities/effects';
import { useChordPattern, useDrumPattern } from '@/entities/pattern';
import { useScaleMode } from '@/entities/scale-mode';
import { useTempo } from '@/entities/tempo';
import { useVolume } from '@/entities/volume';
import { useEffectsUiStore } from '@/features/effects';
import { openLoginModal } from '@/features/auth';
import {
	downloadLocalProject,
	ensureAuth,
	getInitialProjectData,
	listProjects,
	loadProject,
	useAssembleProjectData,
	useProjectState,
	useSaveProject,
} from '@/features/project-save-load';
import { stableStringify } from '@/shared/lib/stableStringify';

import { applyEditingPatternFromProjectData } from '../lib/patternConversions';

type SaveModalState = null | { mode: 'new' | 'as' };

export const useProjectCommands = () => {
	const { save, saveAs } = useSaveProject();
	const [saveModalOpen, setSaveModalOpen] = useState<SaveModalState>(null);
	const [openModal, setOpenModal] = useState(false);
	const [confirmUnsavedOpen, setConfirmUnsavedOpen] = useState(false);
	const [openAfterSave, setOpenAfterSave] = useState(false);
	const [newAfterSave, setNewAfterSave] = useState(false);
	const [confirmForNew, setConfirmForNew] = useState(false);
	const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);
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

	const handleSaveProject = async () => {
		try {
			await save();
		} catch (e: any) {
			if (String(e?.message) === 'NAME_REQUIRED') {
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

	const handleNewProject = () => {
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
			try {
				const name = (doc as any)?.meta?.name ?? id;
				project.setProject(id, String(name));
				try {
					project.setLastSavedHash(stableStringify((doc as any).data));
				} catch {}
			} catch {}
			const d = doc.data as ProjectData;
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
				try {
					const AC = (window.AudioContext ||
						(window as any).webkitAudioContext) as typeof AudioContext;
					const ctx = new AC();

					const audio: any = d.audio;
					const sampleRate = Number(audio.sampleRate || 48000);

					let buffer: AudioBuffer | null = null;

					if (Array.isArray(audio.samples) && audio.samples.length > 0) {
						const data = Float32Array.from(audio.samples as number[]);
						buffer = ctx.createBuffer(1, data.length, sampleRate);
						buffer.getChannelData(0).set(data);
					}

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

	const onSelectLocal = async (doc: any) => {
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
		try {
			const mp = Array.isArray((d as any).melodyPitch) ? ((d as any).melodyPitch as any[]) : [];
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
	};

	const handleSaveModalSubmit = async ({ name, mode }: { name: string; mode: string }) => {
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
	};

	const handleConfirmDiscard = () => {
		setConfirmUnsavedOpen(false);
		if (confirmForNew) {
			resetToInitialProject();
		} else {
			setOpenModal(true);
		}
		setConfirmForNew(false);
	};

	const handleConfirmSave = async () => {
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
	};

	const handleLoginPrompt = () => {
		setLoginRequiredOpen(false);
		openLoginModal();
	};

	return {
		saveModalOpen,
		openModal,
		confirmUnsavedOpen,
		loginRequiredOpen,
		confirmForNew,
		project,
		handleSaveProject,
		handleSaveProjectAs,
		handleOpenProject,
		handleNewProject,
		fetchProjectItems,
		onSelectProject,
		onSelectLocal,
		resetToInitialProject,
		handleSaveModalSubmit,
		handleConfirmDiscard,
		handleConfirmSave,
		handleLoginPrompt,
		closeSaveModal: () => setSaveModalOpen(null),
		closeOpenModal: () => setOpenModal(false),
		closeConfirmUnsaved: () => setConfirmUnsavedOpen(false),
		closeLoginRequired: () => setLoginRequiredOpen(false),
	};
};
