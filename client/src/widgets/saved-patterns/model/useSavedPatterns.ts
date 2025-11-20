// [Model] widgets/model - useSavedPatterns.ts
// 役割: SavedPatternPanel 用のビューモデルと操作ロジックを提供
import { useCallback, useMemo } from 'react';

import { useChordPattern, useDrumPattern } from '@/entities/pattern';
import { useSavedPatternStore } from '@/entities/pattern/model/savedPatternStore';
import { useEditingPatternStore } from '@/entities/pattern/model/editingPatternStore';
import { usePatternEditor } from '@/entities/pattern/model/usePatternEditor';
import { useBarCount } from '@/entities/bar-count';
import { useProjectState } from '@/features/project-save-load';

import type { Pattern } from '@/entities/pattern/model/patternTypes';

export type SavedPatternSlotViewModel = {
	index: number;
	name: string;
	hasData: boolean;
	description: string;
	pattern: Pattern | null;
};

const defaultSlotName = (slotNumber: number) => `Pattern ${slotNumber}`;

const markProjectDirty = () => {
	try {
		useProjectState.getState().setLastSavedHash(null);
	} catch {
		// noop (store not ready on server)
	}
};

export const useSavedPatterns = () => {
	const slots = useSavedPatternStore((state) => state.patterns);
	const savePatternAt = useSavedPatternStore((state) => state.savePattern);
	const renamePatternAt = useSavedPatternStore((state) => state.renamePattern);
	const clearPatternAt = useSavedPatternStore((state) => state.clearPattern);

	const editingPattern = useEditingPatternStore((state) => state.pattern);
	const loadEditingPattern = useEditingPatternStore((state) => state.loadPattern);
	const hasEditingPattern = Boolean(editingPattern);

	const { bars } = usePatternEditor();
	const { chordPattern, setChordPattern } = useChordPattern();
	const { drumPattern, setDrumPattern } = useDrumPattern();
	const { setBarCount } = useBarCount();

	const viewModel = useMemo<SavedPatternSlotViewModel[]>(
		() =>
			slots.map((slot, index) => {
				const hasData = Boolean(slot?.pattern);
				const slotNumber = index + 1;
				return {
					index,
					pattern: slot?.pattern ?? null,
					name: slot?.name ?? defaultSlotName(slotNumber),
					hasData,
					description: hasData
						? `${slot?.pattern?.bars ?? 0} Bars / ${slot?.pattern?.chordsPerBar ?? 0} Chords`
						: '未保存',
				};
			}),
		[slots]
	);

	const saveToSlot = useCallback(
		(index: number) => {
			if (!editingPattern || bars == null) return false;
			savePatternAt(index, editingPattern);
			markProjectDirty();
			return true;
		},
		[editingPattern, bars, savePatternAt]
	);

	const loadFromSlot = useCallback(
		(index: number) => {
			const slot = slots[index];
			if (!slot?.pattern) return false;
			loadEditingPattern(slot.pattern);
			setBarCount(slot.pattern.bars);
			setChordPattern(chordPattern);
			setDrumPattern(drumPattern);
			markProjectDirty();
			return true;
		},
		[
			slots,
			loadEditingPattern,
			setBarCount,
			setChordPattern,
			chordPattern,
			setDrumPattern,
			drumPattern,
		]
	);

	const renameSlot = useCallback(
		(index: number, name: string) => {
			const trimmed = name.trim();
			if (!trimmed) return false;
			renamePatternAt(index, trimmed);
			markProjectDirty();
			return true;
		},
		[renamePatternAt]
	);

	const clearSlot = useCallback(
		(index: number) => {
			clearPatternAt(index);
			markProjectDirty();
			return true;
		},
		[clearPatternAt]
	);

	return {
		slots: viewModel,
		canSave: hasEditingPattern && bars != null,
		saveToSlot,
		loadFromSlot,
		renameSlot,
		clearSlot,
	} as const;
};
