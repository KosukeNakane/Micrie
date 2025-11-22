// [Binder] features/pattern-select - DrumPatternToRhythmSegmentsBinder.tsx
// 役割: DrumPattern の選択内容を rhythmSegments に反映（編集前提の初期化）
import React from 'react';

import { useDrumPattern } from '@/entities/pattern';
import { usePatternEditor } from '@/entities/pattern/model/usePatternEditor';
import { PATTERNS } from '@/features/drums-playback/lib/patterns';

const STEP_BEAT = 0.5; // 8th notes in beats

export const DrumPatternToRhythmSegmentsBinder: React.FC = () => {
	const { drumPattern } = useDrumPattern();
	const { setRhythmSegments } = usePatternEditor();
	const lastAppliedPatternRef = React.useRef<string | null>(null);

	React.useEffect(() => {
		if (!drumPattern) return;
		if (lastAppliedPatternRef.current === drumPattern) return;
		lastAppliedPatternRef.current = drumPattern;
		const src = ((PATTERNS as any)[drumPattern] ?? PATTERNS.basic) as readonly {
			time: number;
			type: 'kick' | 'snare' | 'hihat';
		}[];
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
		} catch {}
	}, [drumPattern, setRhythmSegments]);

	return null;
};
