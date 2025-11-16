// [Model] entities - index.ts
// 役割: アレンジメント管理の公開API
export type {
  ArrangementSnapshot,
  ArrangementPattern,
  ArrangementChordsState,
} from './model/types';
export { ARRANGEMENT_PATTERN_COUNT } from './model/types';
export { useArrangementPatternsStore } from './model/arrangementStore';
export { useBuildArrangementSnapshot, useApplyArrangementSnapshot } from './model/snapshotHooks';
export {
  useArrangementPlayerStore,
  ARRANGEMENT_PERFORMANCE_QUEUE_SIZE,
  selectArrangementQueue,
  selectArrangementPlaybackMode,
  selectArrangementPlaybackStatus,
  type ArrangementPlaybackMode,
  type ArrangementPlaybackStatus,
} from './model/arrangementPlayerStore';
