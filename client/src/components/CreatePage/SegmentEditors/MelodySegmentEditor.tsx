import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { TiArrowSortedUp } from "react-icons/ti";
import { TiArrowSortedDown } from "react-icons/ti";
import { useSegment } from "../../../context/SegmentContext";
import { useScaleMode } from "../../../context/ScaleModeContext";
import * as Tone from "tone";

const GlassButtonUp = styled.button<{ position?: "left" | "right" }>`
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(108, 178, 218, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 4px 8px;
  width: 100%;
  height: 75px;
  box-sizing: border-box;
  position: relative;
  z-index: 0;
  ${({ position }) => position === "left" && `border-top-left-radius: 10px;`}
  ${({ position }) => position === "right" && `border-top-right-radius: 10px;`}
  &:hover {
    background: linear-gradient(135deg, rgb(255, 21, 21), rgba(220, 165, 165, 0.99));
  }
`;

const GlassButtonDown = styled.button`
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(18, 168, 255, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 4px 8px;
  width: 100%;
  height: 75px;
  box-sizing: border-box;
  position: relative;
  z-index: 0;
  &:hover {
    background: linear-gradient(135deg, rgb(9, 103, 255), rgba(0, 0, 0, 0.74));
  }
`;

const StyledSwitchButton = styled.button<{ position?: "left" | "right" }>`
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(108, 178, 218, 0);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 4px 8px;
  width: 100%;
  height: 30px;
  box-sizing: border-box;
  position: relative;
  z-index: 0;
  font-family: "brandon-grotesque", sans-serif;
  ${({ position }) => position === "left" && `border-bottom-left-radius: 10px;`}
  ${({ position }) => position === "right" && `border-bottom-right-radius: 10px;`}
  &:hover {
    background: linear-gradient(135deg, rgb(255, 21, 21), rgba(220, 165, 165, 0.99));
  }
`;

const NoteControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100% / 16);
  box-sizing: border-box;
  overflow: hidden;
`;

// const majorScaleOrder = ["C", "D", "E", "G", "A"];
// const minorScaleOrder = ["C", "D", "D#", "G", "G#"];

const synth = new Tone.Synth().toDestination();

type Props = {
  barIndex: number;
  width: number;
};
const MelodySegmentEditor: React.FC<Props> = ({ barIndex, width }) => {
  const { currentSegments, updateMelodySegment } = useSegment();
  const { scaleMode } = useScaleMode();

  const shiftNote = (index: number, semitone: number) => {
    const note = currentSegments.melody[index].note;
    if (!note || note === "rest") return;

    const match = note.match(/^([A-G]#?)(\d)$/);
    if (!match) return;

    try {
      const midi = Tone.Frequency(note).toMidi();
      const newMidi = midi + semitone;
      const newNote = Tone.Frequency(newMidi, "midi").toNote();
      updateMelodySegment(index, { note: newNote, label: newNote });
      synth.triggerAttackRelease(newNote, "8n");
    } catch (error) {
      console.warn("Note conversion error:", error);
    }
  };

  const previousNotesRef = React.useRef<string[]>([]);

  if (previousNotesRef.current.length !== currentSegments.melody.length) {
    previousNotesRef.current = currentSegments.melody.map(seg =>
      seg.note !== "rest" ? seg.note ?? "C4" : "C4"
    );
  }

  const noteControls = useMemo(() => {
    console.log("今の音", currentSegments.melody);
    return currentSegments.melody.slice(barIndex * 16, barIndex * 16 + 16).map((seg, i) => {
      const globalIndex = barIndex * 16 + i;
      return (
        <NoteControlGroup key={globalIndex}>
          <GlassButtonUp position={i === 0 ? "left" : i === 15 ? "right" : undefined} onClick={() => shiftNote(globalIndex, 1)}><TiArrowSortedUp/></GlassButtonUp>
          <GlassButtonDown onClick={() => shiftNote(globalIndex, -1)}><TiArrowSortedDown/></GlassButtonDown>
          <StyledSwitchButton
            position={i === 0 ? "left" : i === 15 ? "right" : undefined}
            onClick={() => {
              if (seg.note === "rest") {
                const restoredNote = previousNotesRef.current[globalIndex] || "C4";
                updateMelodySegment(globalIndex, { note: restoredNote, label: restoredNote });
              } else {
                const currentNote = typeof seg.note === "string" ? seg.note : "C4";
                previousNotesRef.current[globalIndex] = currentNote;
                updateMelodySegment(globalIndex, { note: "rest", label: "rest" });
              }
            }}
          >
            {seg.note === "rest" ? "○" : "●"}
          </StyledSwitchButton>
        </NoteControlGroup>
      );
    });
  }, [currentSegments.melody, barIndex, scaleMode]);

  return (
    <div style={{ display: "flex", height: "200px", width: `${width}px` }}>
      {noteControls}
    </div>
  );
};

import { memo } from "react";
export default memo(MelodySegmentEditor);