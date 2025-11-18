// [Model] features/model - useArrangementPerformer.ts
// 役割: アレンジメントスロットの再生ロジック
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Tone from 'tone';

import { useArrangementStore } from '@/entities/pattern/model/arrangementStore';
import { useSavedPatternStore } from '@/entities/pattern/model/savedPatternStore';
import { useTempo } from '@/entities/tempo';
import { GlobalAudioEngine } from '@/entities/audio';

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
  const baseOrderRef = useRef<Array<{ patternId: string; index: number }>>([]);
  const shouldLoopRef = useRef(false);

  const stopArrangement = useCallback(() => {
    stopAll();
    shouldLoopRef.current = false;
    setStatus('stopped');
    setCurrentIndex(null);
    baseOrderRef.current = [];
    try { GlobalAudioEngine.instance.setMasterMuted(true); } catch {}
    try { Tone.getTransport().stop(); Tone.getTransport().position = 0; } catch {}
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

  const startPlayback = useCallback(async (order: Array<{ patternId: string; index: number }>) => {
    if (!order.length) return;
    const items = buildPlaybackItems(order);
    if (!items.length) return;
    shouldLoopRef.current = true;
    await playWithEngine(items, {
      onSegmentStart: (slotIndex) => {
        setCurrentIndex(slotIndex);
        setStatus('playing');
      },
      onSegmentComplete: () => {},
      onAllComplete: () => {
        if (!shouldLoopRef.current) {
          setStatus('stopped');
          setCurrentIndex(null);
          try { GlobalAudioEngine.instance.setMasterMuted(true); } catch {}
          return;
        }
        if (!baseOrderRef.current.length) {
          shouldLoopRef.current = false;
          setStatus('stopped');
          setCurrentIndex(null);
          return;
        }
        void startPlayback(baseOrderRef.current);
      },
    });
    setStatus('playing');
    setCurrentIndex(order[0].index);
  }, [buildPlaybackItems, playWithEngine, setCurrentIndex, setStatus]);

  const playArrangement = useCallback(async () => {
    if (playbackMode !== 'arrangement') return;
    const arrangedOrder = slots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => !!slot.patternId)
      .map(({ slot, index }) => ({ patternId: slot.patternId as string, index }));

    if (!arrangedOrder.length) return;
    baseOrderRef.current = arrangedOrder;
    await startPlayback(arrangedOrder);
  }, [playbackMode, slots, startPlayback]);

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
  } as const;
};
