import { useEffect } from 'react';

import { useEditingPatternStore } from '@/entities/pattern/model/editingPatternStore';
import { useSavedPatternStore } from '@/entities/pattern/model/savedPatternStore';

import { makeDefaultPattern } from '../lib/patternConversions';

export const useEnsureDefaultPattern = () => {
	useEffect(() => {
		const saved = useSavedPatternStore.getState().patterns;
		const hasAnySaved = saved.some((slot) => Boolean(slot.pattern));
		const editingPattern = useEditingPatternStore.getState().pattern;
		if (hasAnySaved || editingPattern) return;
		const pattern = makeDefaultPattern();
		useEditingPatternStore.getState().loadPattern(pattern);
	}, []);
};
