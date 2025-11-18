// [Model] features/model - useArrangementPerformer.ts
// 役割: アレンジメントスロットの再生ロジック
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useArrangementStore } from '@/entities/pattern/model/arrangementStore';
import { useSavedPatternStore } from '@/entities/pattern/model/savedPatternStore';
import { useTempo } from '@/entities/tempo';

import { buildArrangementPlayback } from './arrangementPlaybackBuilder';
import {
  useArrangementPerformancePlayer,
  type ArrangementPlaybackItem,
} from './useArrangementPerformancePlayer';

export const useArrangementPerformer = () => {
  const slots = useArrangementStore((state) => state.slots);
  const playbackMode = useArrangementStore((state) => state.playbackMode);
  const currentIndex = useArrangementStore((state) => state.currentIndex);
  const setCurrentIndex = useArrangementStore((state) => state.setCurrentIndex);
  const { tempo } = useTempo();
  const savedPatterns = useSavedPatternStore((state) => state.patterns);
  const [status, setStatus] = useState<'stopped' | 'playing'>('stopped');

  const { playArrangement: playWithEngine, stopAll } = useArrangementPerformancePlayer();
  const playbackOrderRef = useRef<Array<{ patternId: string; index: number }>>([]);

  const stopArrangement = useCallback(() => {
    stopAll();
    setStatus('stopped');
    setCurrentIndex(null);
    playbackOrderRef.current = [];
  }, [setCurrentIndex, setStatus, stopAll]);

  const buildPlaybackItems = useCallback(
    (order: Array<{ patternId: string; index: number }>) => {
      const tempoValue = tempo ?? 120;
      const items: ArrangementPlaybackItem[] = [];
      order.forEach(({ patternId, index }) => {
        const pattern = savedPatterns.find((slot) => slot && slot.id === patternId);
        if (!pattern) return;
        const timeline = buildArrangementPlayback(pattern, { tempo: tempoValue });
        items.push({ slotIndex: index, timeline });
      });
      return items;
    },
    [tempo, savedPatterns],
  );

  const playArrangement = useCallback(async () => {
    if (playbackMode !== 'arrangement') return;
    const arrangedOrder = slots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => !!slot.patternId)
      .map(({ slot, index }) => ({ patternId: slot.patternId as string, index }));

    if (!arrangedOrder.length) return;
    playbackOrderRef.current = arrangedOrder;

    const items = buildPlaybackItems(arrangedOrder);
    if (!items.length) return;

    await playWithEngine(items, {
      onSegmentStart: (slotIndex) => {
        setCurrentIndex(slotIndex);
        setStatus('playing');
      },
      onSegmentComplete: (slotIndex, isLast) => {
        if (isLast) return;
        playbackOrderRef.current = playbackOrderRef.current.filter((entry) => entry.index !== slotIndex);
      },
      onAllComplete: () => {
        playbackOrderRef.current = [];
        setStatus('stopped');
        setCurrentIndex(null);
      },
    });

    setStatus('playing');
    setCurrentIndex(arrangedOrder[0].index);
  }, [playbackMode, slots, buildPlaybackItems, playWithEngine, setCurrentIndex, setStatus]);

  const skipCurrentSlot = useCallback(async () => {
    if (status !== 'playing') return;
    if (!playbackOrderRef.current.length) {
      stopArrangement();
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
    const items = buildPlaybackItems(rest);
    if (!items.length) {
      setStatus('stopped');
      setCurrentIndex(null);
      return;
    }
    await playWithEngine(items, {
      onSegmentStart: (slotIndex) => {
        setCurrentIndex(slotIndex);
      },
      onSegmentComplete: (slotIndex, isLast) => {
        if (isLast) return;
        playbackOrderRef.current = playbackOrderRef.current.filter((entry) => entry.index !== slotIndex);
      },
      onAllComplete: () => {
        playbackOrderRef.current = [];
        setStatus('stopped');
        setCurrentIndex(null);
      },
    });
    setStatus('playing');
    setCurrentIndex(rest[0].index);
  }, [status, buildPlaybackItems, playWithEngine, stopAll, stopArrangement, setCurrentIndex, setStatus]);

  const arrangementInfo = useMemo(() => {
    return slots.map((entry, index) => {
      const pattern = savedPatterns.find((slot) => slot && slot.id === entry.patternId) ?? null;
      return {
        index,
        patternId: entry.patternId,
        name: pattern?.name ?? 'EMPTY',
        isActive: status === 'playing' && currentIndex === index,
      };
    });
  }, [slots, savedPatterns, status, currentIndex]);

  useEffect(() => {
    const unsubscribe = useSavedPatternStore.subscribe((state) => {
      const validIds = new Set(
        state.patterns.filter((slot): slot is NonNullable<typeof slot> => !!slot).map((slot) => slot.id),
      );
      const store = useArrangementStore.getState();
      store.slots.forEach((slot, index) => {
        if (slot.patternId && !validIds.has(slot.patternId)) {
          store.setSlot(index, null);
        }
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (playbackMode !== 'arrangement' && status === 'playing') {
      stopArrangement();
    }
  }, [playbackMode, status, stopArrangement]);

  return {
    arrangementInfo,
    playbackMode,
    status,
    playArrangement,
    stopArrangement,
    skipCurrentSlot,
  } as const;
};
