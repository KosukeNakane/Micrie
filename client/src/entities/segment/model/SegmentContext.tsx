import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

export type Segment = {
  label: string;
  start: number;
  end: number;
  hz?: number;
  note?: string;
  confidence?: number;
  rms?: number;
  confidence_rms?: number;
};

type SegmentContextType = {
  rhythmSegments: Segment[];
  melodySegments: Segment[];
  loopMode: 'rhythm' | 'melody' | 'both';
  setRhythmSegments: (segments: Segment[]) => void;
  setMelodySegments: (segments: Segment[]) => void;
  setLoopMode: (mode: 'rhythm' | 'melody' | 'both') => void;
  currentSegments: { rhythm: Segment[]; melody: Segment[] };
  updateMelodySegment: (index: number, newData: Partial<Segment>) => void;
  updateRhythmSegment: (index: number, newData: Partial<Segment>) => void;
  audioBuffers: { melody: AudioBuffer | null; rhythm: AudioBuffer | null };
  setContextAudioBuffer: (mode: 'melody' | 'rhythm', buffer: AudioBuffer | null) => void;
  currentBuffer: AudioBuffer | null;
  recMode: 'melody' | 'rhythm';
  setRecMode: (mode: 'melody' | 'rhythm') => void;
};

const SegmentContext = createContext<SegmentContextType | undefined>(undefined);

export const SegmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rhythmSegments, setRhythmSegments] = useState<Segment[]>([]);
  const [melodySegments, setMelodySegments] = useState<Segment[]>([]);
  const [loopMode, setLoopMode] = useState<'rhythm' | 'melody' | 'both'>('melody');
  const [melodyBuffer, setMelodyBuffer] = useState<AudioBuffer | null>(null);
  const [rhythmBuffer, setRhythmBuffer] = useState<AudioBuffer | null>(null);
  const [recMode, setRecMode] = useState<'melody' | 'rhythm'>('melody');

  const setContextAudioBuffer = (mode: 'melody' | 'rhythm', buffer: AudioBuffer | null) => {
    if (mode === 'melody') setMelodyBuffer(buffer); else setRhythmBuffer(buffer);
  };

  const currentBuffer = useMemo(() => {
    if (loopMode === 'melody') return melodyBuffer;
    if (loopMode === 'rhythm') return rhythmBuffer;
    if (loopMode === 'both') return null;
    return null;
  }, [loopMode, melodyBuffer, rhythmBuffer]);

  const currentSegments = useMemo(() => ({
    rhythm: loopMode === 'melody' ? [] : rhythmSegments,
    melody: loopMode === 'rhythm' ? [] : melodySegments,
  }), [loopMode, rhythmSegments, melodySegments]);

  const updateMelodySegment = (index: number, newData: Partial<Segment>) => {
    setMelodySegments(prev => { const next = [...prev]; next[index] = { ...next[index], ...newData }; return next; });
  };
  const updateRhythmSegment = (index: number, newData: Partial<Segment>) => {
    setRhythmSegments(prev => { const next = [...prev]; next[index] = { ...next[index], ...newData }; return next; });
  };

  useEffect(() => {
    console.log('🎛 loopMode:', loopMode);
    console.log('🎧 melodyBuffer:', melodyBuffer);
    console.log('🥁 rhythmBuffer:', rhythmBuffer);
    console.log('📦 currentBuffer:', currentBuffer);
  }, [loopMode, melodyBuffer, rhythmBuffer, currentBuffer]);

  return (
    <SegmentContext.Provider value={{
      rhythmSegments,
      melodySegments,
      loopMode,
      setRhythmSegments,
      setMelodySegments,
      setLoopMode,
      currentSegments,
      updateMelodySegment,
      updateRhythmSegment,
      audioBuffers: { melody: melodyBuffer, rhythm: rhythmBuffer },
      setContextAudioBuffer,
      currentBuffer,
      recMode,
      setRecMode,
    }}>
      {children}
    </SegmentContext.Provider>
  );
};

export const useSegment = (): SegmentContextType => {
  const context = useContext(SegmentContext);
  if (!context) throw new Error('useSegment must be used within a SegmentProvider');
  return context;
};
