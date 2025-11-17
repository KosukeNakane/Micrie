// [Binder] features/model - ChordPatternToChordsBinder.tsx
// 役割: エンジン/Transportとアプリ状態の接続（副作用）
import React from 'react';

import { PRESETS, type ChordPresetSlot as PresetSlot } from '@shared/lib/chord-presets';

import { useBarCount } from '@/entities/bar-count';
import { useChordPattern } from '@/entities/pattern';
import { useEditingPatternStore } from '@/entities/pattern/model/editingPatternStore';
import { usePatternEditor } from '@/entities/pattern/model/usePatternEditor';

// 2bars想定のデフォルト進行（slot数=8）。barsが増えた場合は繰り返しで埋める。
// PRESETS は shared/lib に分離

export const ChordPatternToChordsBinder: React.FC = () => {
	const { chordPattern } = useChordPattern();
	const { bars, chordsPerBar, applyChordPreset, setBars } = usePatternEditor();
	const hasPattern = useEditingPatternStore((state) => Boolean(state.pattern));
	const { barCount } = useBarCount();
	const barsInitializedRef = React.useRef(false);
	const presetInitializedRef = React.useRef(false);

	React.useEffect(() => {
		if (!hasPattern) {
			barsInitializedRef.current = false;
			presetInitializedRef.current = false;
		}
	}, [hasPattern]);

	// keep bars in sync with global barCount
	React.useEffect(() => {
		if (!hasPattern || bars == null || barCount == null || barsInitializedRef.current) return;
		setBars(barCount);
		barsInitializedRef.current = true;
	}, [hasPattern, barCount, bars, setBars]);

	// apply preset when chordPattern changes
	React.useEffect(() => {
		if (!hasPattern || bars == null || chordsPerBar == null || presetInitializedRef.current) return;
		const targetBars = barCount ?? bars;
		if (targetBars == null) return;
		const base = PRESETS[chordPattern] || PRESETS['pattern1'];
		// extend or trim to bars*chordsPerBar
		const total = Math.max(1, targetBars * chordsPerBar);
		const list: PresetSlot[] = Array.from({ length: total }, (_, i) => base[i % base.length]);
		applyChordPreset(list as any);
		presetInitializedRef.current = true;
	}, [hasPattern, chordPattern, bars, chordsPerBar, barCount, applyChordPreset]);

	return null;
};
