// [Model] features/model - useArrangementPerformer.ts
// 役割: キューベースのアレンジメント再生ロジック
import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  useArrangementPlayerStore,
  selectArrangementQueue,
  selectArrangementPlaybackStatus,
  selectArrangementPlaybackMode,
} from '@/entities/arrangement';
import { useArrangementPatternsStore } from '@/entities/arrangement/model/arrangementStore';
import { useTempo } from '@/entities/tempo';

import { buildArrangementPlayback } from './arrangementPlaybackBuilder';
import {
  useArrangementPerformancePlayer,
  type QueuePlaybackItem,
} from './useArrangementPerformancePlayer';

export const useArrangementPerformer = () => {
  const queue = useArrangementPlayerStore(selectArrangementQueue);
  const playbackMode = useArrangementPlayerStore(selectArrangementPlaybackMode);
  const status = useArrangementPlayerStore(selectArrangementPlaybackStatus);
  const currentIndex = useArrangementPlayerStore((state) => state.currentIndex);
  const setStatus = useArrangementPlayerStore((state) => state.setStatus);
  const setCurrentIndex = useArrangementPlayerStore((state) => state.setCurrentIndex);
  const assignSlotToQueue = useArrangementPlayerStore((state) => state.assignSlotToQueue);
  const clearQueueSlot = useArrangementPlayerStore((state) => state.clearQueueSlot);
  const { tempo } = useTempo();
  const patternsSnapshot = useArrangementPatternsStore((state) => state.patterns);

  const { playQueue: playWithEngine, stopAll } = useArrangementPerformancePlayer();
  const playbackOrderRef = useRef<Array<{ slotId: string; index: number }>>([]);

  const stopQueue = useCallback(() => {
    stopAll();
    setStatus('stopped');
    setCurrentIndex(null);
    playbackOrderRef.current = [];
  }, [setCurrentIndex, setStatus, stopAll]);

  const buildQueueItems = useCallback((order: Array<{ slotId: string; index: number }>) => {
    const patternsState = patternsSnapshot;
    const tempoValue = tempo ?? 120;
    const items: QueuePlaybackItem[] = [];
    order.forEach(({ slotId, index }) => {
      const pattern = patternsState.find((s) => s && s.id === slotId);
      if (!pattern) return;
      const timeline = buildArrangementPlayback(pattern.snapshot, { tempo: tempoValue });
      items.push({ queueIndex: index, timeline });
    });
    return items;
  }, [tempo, patternsSnapshot]);

  const playQueue = useCallback(async () => {
    if (playbackMode !== 'queue') return;
    const queueState = useArrangementPlayerStore.getState().queue;
    const arrangedOrder = queueState
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => !!slot.slotId)
      .map(({ slot, index }) => ({ slotId: slot.slotId!, index }));

    if (!arrangedOrder.length) return;

    playbackOrderRef.current = arrangedOrder;

    const items = buildQueueItems(arrangedOrder);
    if (!items.length) return;

    await playWithEngine(items, {
      onSegmentStart: (queueIndex) => {
        setCurrentIndex(queueIndex);
        setStatus('playing');
      },
      onSegmentComplete: (queueIndex, isLast) => {
        if (isLast) return;
        playbackOrderRef.current = playbackOrderRef.current.filter((entry) => entry.index !== queueIndex);
      },
      onAllComplete: () => {
        playbackOrderRef.current = [];
        setStatus('stopped');
        setCurrentIndex(null);
      },
    });

    setStatus('playing');
    setCurrentIndex(arrangedOrder[0].index);
  }, [playbackMode, buildQueueItems, playWithEngine, setCurrentIndex, setStatus]);

  const skipCurrent = useCallback(async () => {
    if (status !== 'playing') return;
    if (!playbackOrderRef.current.length) {
      stopQueue();
      return;
    }
    const [, ...rest] = playbackOrderRef.current;
    playbackOrderRef.current = rest;
    stopAll();
    if (!rest.length) {
      playbackOrderRef.current = [];
      setStatus('stopped');
      setCurrentIndex(null);
      return;
    }
    const items = buildQueueItems(rest);
    if (!items.length) {
      setStatus('stopped');
      setCurrentIndex(null);
      return;
    }
    await playWithEngine(items, {
      onSegmentStart: (queueIndex) => {
        setCurrentIndex(queueIndex);
      },
      onSegmentComplete: (queueIndex, isLast) => {
        if (isLast) return;
        playbackOrderRef.current = playbackOrderRef.current.filter((entry) => entry.index !== queueIndex);
      },
      onAllComplete: () => {
        playbackOrderRef.current = [];
        setStatus('stopped');
        setCurrentIndex(null);
      },
    });
    setStatus('playing');
    setCurrentIndex(rest[0].index);
  }, [status, buildQueueItems, playWithEngine, stopAll, stopQueue, setCurrentIndex, setStatus]);

  const queueInfo = useMemo(() => {
    return queue.map((entry, index) => {
      const pattern = patternsSnapshot.find((s) => s && s.id === entry.slotId) ?? null;
      return {
        index,
        slotId: entry.slotId,
        name: pattern?.name ?? 'EMPTY',
        assignedAt: entry.assignedAt,
        isActive: status === 'playing' && currentIndex === index,
      };
    });
  }, [queue, patternsSnapshot, status, currentIndex]);

  useEffect(() => {
    const unsubscribe = useArrangementPatternsStore.subscribe((state) => {
      const validIds = new Set(
        state.patterns
          .filter((slot): slot is NonNullable<typeof slot> => !!slot)
          .map((slot) => slot.id),
      );
      const { queue: currentQueue, assignSlotToQueue: assign } = useArrangementPlayerStore.getState();
      currentQueue.forEach((entry, index) => {
        if (entry.slotId && !validIds.has(entry.slotId)) {
          assign(index, null);
        }
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (playbackMode !== 'queue' && status === 'playing') {
      stopQueue();
    }
  }, [playbackMode, status, stopQueue]);

  return {
    queueInfo,
    playbackMode,
    status,
    playQueue,
    stopQueue,
    skipCurrent,
    assignSlotToQueue,
    clearQueueSlot,
  } as const;
};
