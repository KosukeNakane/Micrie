// [Model] features/model - useArrangementSlots.ts
// 役割: アレンジメントスロット管理のビジネスロジックをUI向けに提供
import { useCallback, useMemo } from 'react';

import {
  ARRANGEMENT_SLOT_COUNT,
  useArrangementSlotsStore,
  useApplyArrangementSnapshot,
  useBuildArrangementSnapshot,
} from '@/entities/arrangement';

export type ArrangementSlotViewModel = {
  index: number;
  slotNumber: number;
  name: string;
  savedAt: number | null;
  hasData: boolean;
};

const defaultSlotName = (slotNumber: number) => `スロット ${slotNumber}`;

export const useArrangementSlots = () => {
  const slots = useArrangementSlotsStore((state) => state.slots);
  const saveSlot = useArrangementSlotsStore((state) => state.saveSlot);
  const clearSlot = useArrangementSlotsStore((state) => state.clearSlot);

  const buildSnapshot = useBuildArrangementSnapshot();
  const applySnapshot = useApplyArrangementSnapshot();

  const viewModel = useMemo<ArrangementSlotViewModel[]>(
    () =>
      Array.from({ length: ARRANGEMENT_SLOT_COUNT }, (_, index) => {
        const slot = slots[index];
        const slotNumber = index + 1;
        return {
          index,
          slotNumber,
          name: slot?.name ?? defaultSlotName(slotNumber),
          savedAt: slot?.savedAt ?? null,
          hasData: Boolean(slot),
        };
      }),
    [slots],
  );

  const handleSave = useCallback(
    (index: number, name?: string) => {
      const slotNumber = index + 1;
      const snapshot = buildSnapshot();
      const targetName = name?.trim() || slots[index]?.name || defaultSlotName(slotNumber);
      saveSlot(index, { name: targetName, snapshot });
    },
    [buildSnapshot, saveSlot, slots],
  );

  const handleLoad = useCallback(
    (index: number) => {
      const slot = slots[index];
      if (!slot) return false;
      applySnapshot(slot.snapshot);
      return true;
    },
    [applySnapshot, slots],
  );

  const handleClear = useCallback(
    (index: number) => {
      clearSlot(index);
    },
    [clearSlot],
  );

  return {
    slots: viewModel,
    saveSlot: handleSave,
    loadSlot: handleLoad,
    clearSlot: handleClear,
  } as const;
};
