// [UI] features/ui - RhythmSegmentEditor.tsx
// 役割: 表示・入力のUIコンポーネント
import styled from "@emotion/styled";
import React from "react";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import * as Tone from "tone";

import { useGlobalAudio } from "@entities/audio/model/GlobalAudioContext";
import { usePatternEditor } from "@/entities/pattern/model/usePatternEditor";
import { useSegment } from "@entities/segment/model/SegmentContext";

const GlassButtonUp = styled.button`
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(108, 178, 218, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 4px 8px;
  width: 100%; height: 75px; box-sizing: border-box; position: relative; z-index: 0;
  &:hover { background: linear-gradient(135deg, rgb(255, 21, 21), rgba(220, 165, 165, 0.99)); }
`;

const GlassButtonDown = styled.button`
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(108, 178, 218, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 4px 8px;
  width: 100%; height: 75px; box-sizing: border-box; position: relative; z-index: 0;
  &:hover { background: linear-gradient(135deg, rgb(9, 103, 255), rgba(121, 155, 226, 0.74)); }
`;

const StyledSwitchButton = styled.button<{ position?: "left" | "right" }>`
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(108, 178, 218, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 4px 8px;
  width: 100%; height: 30px; box-sizing: border-box; position: relative; z-index: 0;
  font-family: "brandon-grotesque", sans-serif;
  ${({ position }) => position === "left" && `border-bottom-left-radius: 10px;`}
  ${({ position }) => position === "right" && `border-bottom-right-radius: 10px;`}
  &:hover { background: linear-gradient(135deg, rgb(255, 21, 21), rgba(220, 165, 165, 0.99)); }
`;

const drumOrder = ["kick", "snare", "hihat"] as const;

type Props = { barIndex: number; width?: number };

export const RhythmSegmentEditor = ({ barIndex, width = 600 }: Props) => {
  const { currentSegments } = useSegment();
  const { updateRhythmSegment } = usePatternEditor();
  void width;
  const engine = useGlobalAudio();
  const synths = React.useMemo(() => ({
    kick: new Tone.MembraneSynth(),
    snare: new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0 } }),
    hihat: new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.0001, decay: 0.02, sustain: 0 } }),
  }) as const, []);

  React.useEffect(() => {
    (async () => {
      try { if ((Tone.getContext() as any).state !== 'running') await Tone.start(); } catch {}
      try { await engine.ensureStarted(); } catch {}
      const ctx = engine.audioContext;
      if (ctx && Tone.getContext().rawContext !== ctx) {
        try { const toneCtx = new Tone.Context({ context: ctx as any }); Tone.setContext(toneCtx); } catch {}
      }
      const input = engine.getChannelInput('drum-preview') as unknown as AudioNode | null;
      try { (synths.kick as any).disconnect?.(); } catch {}
      try { (synths.snare as any).disconnect?.(); } catch {}
      try { (synths.hihat as any).disconnect?.(); } catch {}
      if (input) {
        try { (synths.kick as any).connect(input as any); } catch {}
        try { (synths.snare as any).connect(input as any); } catch {}
        try { (synths.hihat as any).connect(input as any); } catch {}
      }
    })();
    return () => {
      try { synths.kick.dispose(); } catch {}
      try { synths.snare.dispose(); } catch {}
      try { synths.hihat.dispose(); } catch {}
    };
  }, [engine, synths]);

  const shiftDrum = (index: number, direction: number) => {
    const label = currentSegments.rhythm[index].label;
    if (!label || label === "noise") return;
    const currentIdx = drumOrder.indexOf(label as any);
    const newIdx = (currentIdx + direction + drumOrder.length) % drumOrder.length;
    const newNote = drumOrder[newIdx];
    updateRhythmSegment(index, { label: newNote });
    // プレビュー再生のため、AudioContext/Tone を確実に起動しミュート解除後に再生
    (async () => {
      try {
        if ((Tone.getContext() as any).state !== 'running') {
          await Tone.start();
        }
      } catch {}
      try { await engine.ensureStarted(); } catch {}
      try { await engine.setMasterMuted(false); } catch {}
      try {
        if (newNote === "kick") synths.kick.triggerAttackRelease("C1", "8n");
        else if (newNote === "snare") synths.snare.triggerAttackRelease("8n");
        else if (newNote === "hihat") synths.hihat.triggerAttackRelease("16n");
      } catch {}
    })();
  };

  const previousNotesRef = React.useRef<string[]>([]);
  if (previousNotesRef.current.length !== currentSegments.rhythm.length) {
    previousNotesRef.current = currentSegments.rhythm.map((seg) => (seg.label !== "noise" ? seg.label ?? "kick" : "kick"));
  }

  return (
    <div>
      <div style={{ display: "flex", height: "200px", width: '100%' }}>
        {currentSegments.rhythm.slice(barIndex * 16, barIndex * 16 + 16).map((seg, i) => {
          const globalIndex = barIndex * 16 + i;
          return (
            <div key={globalIndex} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "calc(100% / 16)", boxSizing: "border-box", borderTopLeftRadius: i === 0 ? "10px" : undefined, borderBottomLeftRadius: i === 0 ? "10px" : undefined, borderTopRightRadius: i === 15 ? "10px" : undefined, borderBottomRightRadius: i === 15 ? "10px" : undefined, overflow: "hidden" }}>
              <GlassButtonUp onClick={() => shiftDrum(globalIndex, 1)}><TiArrowSortedUp /></GlassButtonUp>
              <GlassButtonDown onClick={() => shiftDrum(globalIndex, -1)}><TiArrowSortedDown /></GlassButtonDown>
              <StyledSwitchButton position={i === 0 ? "left" : i === 15 ? "right" : undefined} onClick={() => {
                if (seg.label === "noise") {
                  updateRhythmSegment(globalIndex, { label: previousNotesRef.current[globalIndex] || "kick" });
                } else {
                  previousNotesRef.current[globalIndex] = typeof seg.label === "string" ? seg.label : "kick";
                  updateRhythmSegment(globalIndex, { label: "noise" });
                }
              }}>switch</StyledSwitchButton>
            </div>
          );
        })}
      </div>
    </div>
  );
};
