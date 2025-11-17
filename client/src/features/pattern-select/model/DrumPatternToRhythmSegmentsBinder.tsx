// [Binder] features/pattern-select - DrumPatternToRhythmSegmentsBinder.tsx
// 役割: DrumPattern の選択内容を rhythmSegments に反映（編集前提の初期化）
import React from 'react';

import { useDrumPattern } from '@/entities/pattern';
import { useEditingPatternStore } from '@/entities/pattern/model/editingPatternStore';
import { usePatternEditor } from '@/entities/pattern/model/usePatternEditor';
import { PATTERNS } from '@/features/drums-playback/lib/patterns';

const STEP_BEAT = 0.5; // 8th notes in beats

export const DrumPatternToRhythmSegmentsBinder: React.FC = () => {
	const { drumPattern } = useDrumPattern();
	const { setRhythmSegments } = usePatternEditor();
	const hasPattern = useEditingPatternStore((state) => Boolean(state.pattern));
	const initializedRef = React.useRef(false);

	React.useEffect(() => {
		if (!hasPattern) {
			initializedRef.current = false;
		}
	}, [hasPattern]);

	React.useEffect(() => {
		if (!hasPattern || initializedRef.current) return;
		const src = (PATTERNS as any)[drumPattern] as readonly { time: number; type: 'kick' | 'snare' | 'hihat' }[];
		const next = Array.from({ length: 16 }, (_, i) => ({
			label: '' as string,
			start: i * STEP_BEAT,
			end: (i + 1) * STEP_BEAT,
		}));
		src.forEach((ev) => {
			const idx = Math.round(ev.time / STEP_BEAT);
			if (idx >= 0 && idx < 16) next[idx].label = ev.type;
		});
		try {
			setRhythmSegments(next as any);
			initializedRef.current = true;
		} catch {}
	}, [drumPattern, setRhythmSegments, hasPattern]);

	return null;
};
