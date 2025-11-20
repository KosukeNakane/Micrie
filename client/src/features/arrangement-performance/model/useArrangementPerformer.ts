// [Model] features/model - useArrangementPerformer.ts
// 役割: アレンジメントスロットの再生ロジック
import { useCallback, useEffect, useMemo } from 'react';
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
  const status = useArrangementStore((state) => state.status);
  const setStatus = useArrangementStore((state) => state.setStatus);
  const { tempo } = useTempo();
  const savedPatterns = useSavedPatternStore((state) => state.patterns);

  const { playArrangement: playWithEngine, stopAll } = useArrangementPerformancePlayer();

  const stopArrangement = useCallback(() => {
    stopAll();
    setStatus('stopped');
    setCurrentIndex(null);
    try { GlobalAudioEngine.instance.setMasterMuted(true); } catch {}
    try { Tone.getTransport().stop(); Tone.getTransport().position = 0; } catch {}
  }, [setCurrentIndex, setStatus, stopAll]);

  const buildPlaybackItems = useCallback(
    (order: Array<{ patternId: string; index: number }>) => {
      const tempoValue = tempo ?? 120;
      const items: ArrangementPlaybackItem[] = [];
      order.forEach(({ patternId, index }) => {
        const slot = savedPatterns.find((entry) => entry.pattern && entry.pattern.id === patternId);
        if (!slot?.pattern) return;
        const timeline = buildArrangementPlayback(slot.pattern, { tempo: tempoValue });
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
    await playWithEngine(items, {
      onSegmentStart: (slotIndex) => {
        setCurrentIndex(slotIndex);
        setStatus('playing');
      },
      onSegmentComplete: () => {},
      onAllComplete: () => {
        setStatus('stopped');
        setCurrentIndex(null);
        try { GlobalAudioEngine.instance.setMasterMuted(true); } catch {}
      },
    }, { loop: true });
    setStatus('playing');
    setCurrentIndex(order[0].index);
  }, [buildPlaybackItems, playWithEngine, setCurrentIndex, setStatus]);

  const pauseArrangement = useCallback(() => {
    if (status !== 'playing') return;
    try { GlobalAudioEngine.instance.setMasterMuted(true); } catch {}
    try { Tone.getTransport().pause(); } catch {}
    setStatus('paused');
  }, [setStatus, status]);

  const playArrangement = useCallback(async () => {
    if (playbackMode !== 'arrangement') return;
    if (status === 'paused') {
      try { await GlobalAudioEngine.instance.ensureStarted(); } catch {}
      try { await GlobalAudioEngine.instance.setMasterMuted(false); } catch {}
      try { Tone.getTransport().start(); } catch {}
      setStatus('playing');
      return;
    }
    const arrangedOrder = slots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => !!slot.patternId)
      .map(({ slot, index }) => ({ patternId: slot.patternId as string, index }));

    if (!arrangedOrder.length) return;
    await startPlayback(arrangedOrder);
  }, [playbackMode, slots, startPlayback, setStatus, status]);

  const arrangementInfo = useMemo(() => {
    return slots.map((entry, index) => {
      const slot = savedPatterns.find((saved) => saved.pattern && saved.pattern.id === entry.patternId) ?? null;
      return {
        index,
        patternId: entry.patternId,
        name: slot?.name ?? 'EMPTY',
        isActive: status === 'playing' && currentIndex === index,
      };
    });
  }, [slots, savedPatterns, status, currentIndex]);

  useEffect(() => {
    const unsubscribe = useSavedPatternStore.subscribe((state) => {
      const validIds = new Set(
        state.patterns
          .map((slot) => slot.pattern?.id)
          .filter((id): id is string => typeof id === 'string'),
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
    if (playbackMode !== 'arrangement' && (status === 'playing' || status === 'paused')) {
      stopArrangement();
    }
  }, [playbackMode, status, stopArrangement]);

  return {
    arrangementInfo,
    playbackMode,
    status,
    playArrangement,
    stopArrangement,
    pauseArrangement,
  } as const;
};
