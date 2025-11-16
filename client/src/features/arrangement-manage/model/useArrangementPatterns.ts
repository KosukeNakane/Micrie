// [Model] features/model - useArrangementPatterns.ts
// 役割: アレンジメントパターン管理のビジネスロジックをUI向けに提供
import { useCallback, useMemo } from 'react';

import {
  ARRANGEMENT_PATTERN_COUNT,
  useArrangementPatternsStore,
  useApplyArrangementSnapshot,
  useBuildArrangementSnapshot,
} from '@/entities/arrangement';

export type ArrangementPatternViewModel = {
  index: number;
  patternNumber: number;
  name: string;
  savedAt: number | null;
  hasData: boolean;
};

const defaultPatternName = (patternNumber: number) => `パターン ${patternNumber}`;

export const useArrangementPatterns = () => {
  const patterns = useArrangementPatternsStore((state) => state.patterns);
  const savePattern = useArrangementPatternsStore((state) => state.savePattern);
  const clearPattern = useArrangementPatternsStore((state) => state.clearPattern);

  const buildSnapshot = useBuildArrangementSnapshot();
  const applySnapshot = useApplyArrangementSnapshot();

  const viewModel = useMemo<ArrangementPatternViewModel[]>(
    () =>
      Array.from({ length: ARRANGEMENT_PATTERN_COUNT }, (_, index) => {
        const pattern = patterns[index];
        const patternNumber = index + 1;
        return {
          index,
          patternNumber,
          name: pattern?.name ?? defaultPatternName(patternNumber),
          savedAt: pattern?.savedAt ?? null,
          hasData: Boolean(pattern),
        };
      }),
    [patterns],
  );

  const handleSave = useCallback(
    (index: number, name?: string) => {
      const patternNumber = index + 1;
      const snapshot = buildSnapshot();
      const targetName = name?.trim() || patterns[index]?.name || defaultPatternName(patternNumber);
      savePattern(index, { name: targetName, snapshot });
    },
    [buildSnapshot, savePattern, patterns],
  );

  const handleLoad = useCallback(
    (index: number) => {
      const pattern = patterns[index];
      if (!pattern) return false;
      applySnapshot(pattern.snapshot);
      return true;
    },
    [applySnapshot, patterns],
  );

  const handleClear = useCallback(
    (index: number) => {
      clearPattern(index);
    },
    [clearPattern],
  );

  return {
    patterns: viewModel,
    savePattern: handleSave,
    loadPattern: handleLoad,
    clearPattern: handleClear,
  } as const;
};
