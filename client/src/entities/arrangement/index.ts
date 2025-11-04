// [Model] entities - index.ts
// 役割: アレンジメント管理の公開API
export type {
  ArrangementSnapshot,
  ArrangementSlot,
  ArrangementChordsState,
} from './model/types';
export { ARRANGEMENT_SLOT_COUNT } from './model/types';
export { useArrangementSlotsStore } from './model/arrangementStore';
export { useBuildArrangementSnapshot, useApplyArrangementSnapshot } from './model/snapshotHooks';
