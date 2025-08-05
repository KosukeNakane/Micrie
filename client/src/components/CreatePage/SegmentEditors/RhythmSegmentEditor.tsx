// リズムセグメント編集用のUIコンポーネント。
// 小節ごとにkick/snare/hihat/noiseの打ち込みと切り替えを行える。

import React from "react";
import styled from "@emotion/styled";
import { useSegment } from "../../../context/SegmentContext";
import * as Tone from "tone";
import { TiArrowSortedUp } from "react-icons/ti";
import { TiArrowSortedDown } from "react-icons/ti";

const GlassButtonUp = styled.button`
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
  &:hover {
   background: linear-gradient(135deg, rgb(255, 21, 21), rgba(220, 165, 165, 0.99));
 }
`;

const GlassButtonDown = styled.button`
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
  &:hover {
    background: linear-gradient(135deg, rgb(9, 103, 255), rgba(121, 155, 226, 0.74));
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
  ${({ position }) =>
    position === "left" &&
    `border-bottom-left-radius: 10px;`}
  ${({ position }) =>
    position === "right" &&
    `border-bottom-right-radius: 10px;`}
  &:hover {
    background: linear-gradient(135deg, rgb(255, 21, 21), rgba(220, 165, 165, 0.99));
  }
`;

const drumOrder = ["kick", "snare", "hihat"];

type Props = {
 barIndex: number;
};

const synths = {
  kick: new Tone.MembraneSynth().toDestination(),
  snare: new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
  }).toDestination(),
  hihat: new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.0001, decay: 0.02, sustain: 0 },
  }).toDestination(),
} as const;

export const RhythmSegmentEditor = ({ barIndex }: Props) => {
  const { currentSegments, updateRhythmSegment } = useSegment();

  const shiftDrum = (index: number, direction: number) => {
    const label = currentSegments.rhythm[index].label;
    if (!label || label === "noise") return;

    const currentIdx = drumOrder.indexOf(label);
    let newIdx = (currentIdx + direction + drumOrder.length) % drumOrder.length;
    const newNote = drumOrder[newIdx];
    updateRhythmSegment(index, { label: newNote });
    if (newNote === "kick") {
      synths.kick.triggerAttackRelease("C1", "8n");
    } else if (newNote === "snare") {
      synths.snare.triggerAttackRelease("8n");
    } else if (newNote === "hihat") {
      synths.hihat.triggerAttackRelease("16n");
    }
  };

  const previousNotesRef = React.useRef<string[]>([]);

  if (previousNotesRef.current.length !== currentSegments.rhythm.length) {
    previousNotesRef.current = currentSegments.rhythm.map((seg) =>
      seg.label !== "noise" ? seg.label ?? "kick" : "kick"
    );
  }

  return (
   <div style={{
      // display: "flex",
      // width: "600px",
      // justifyContent: "space-between"
    }}>
    <div style={{
      display: "flex",
      // marginTop: "-3px",
      // borderBottom: "1px solid #ccc",
      height: "200px",
      width: "600px",
      // justifyContent: "space-between"
    }}>
      {currentSegments.rhythm.slice(barIndex * 8, barIndex * 8 + 8).map((seg, i) => {
        const globalIndex = barIndex * 8 + i;
        return (
          <div
            key={globalIndex}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "75px",
              boxSizing: "border-box",
              borderTopLeftRadius: i === 0 ? "10px" : undefined,
              borderBottomLeftRadius: i === 0 ? "10px" : undefined,
              borderTopRightRadius: i === 7 ? "10px" : undefined,
              borderBottomRightRadius: i === 7 ? "10px" : undefined,
              overflow: "hidden",
            }}
          >
            
          <GlassButtonUp onClick={() => shiftDrum(globalIndex, 1)}><TiArrowSortedUp/></GlassButtonUp>
          <GlassButtonDown onClick={() => shiftDrum(globalIndex, -1)}><TiArrowSortedDown/></GlassButtonDown>
            {/* <span
              style={{ margin: "0 8px", cursor: "pointer", zIndex: 100, position: "relative", fontFamily: '"brandon-grotesque", sans-serif' }}
              onClick={() => {
                if (seg.label && seg.label !== "noise") {
                  if (seg.label === "kick") {
                    synths.kick.triggerAttackRelease("C1", "8n");
                  } else if (seg.label === "snare") {
                    synths.snare.triggerAttackRelease("8n");
                  } else if (seg.label === "hihat") {
                    synths.hihat.triggerAttackRelease("16n");
                  }
                }
              }}
            >
              {typeof seg.label !== "string" || seg.label === "noise" ? "rest" : seg.label}
            </span>
          */}
            <StyledSwitchButton
              position={i === 0 ? "left" : i === 7 ? "right" : undefined}
              onClick={() => {
                if (seg.label === "noise") {
                  updateRhythmSegment(globalIndex, { label: previousNotesRef.current[globalIndex] || "kick" });
                } else {
                  previousNotesRef.current[globalIndex] = typeof seg.label === "string" ? seg.label : "kick";
                  updateRhythmSegment(globalIndex, { label: "noise" });
                }
              }}
            >
              switch
            </StyledSwitchButton>

          </div>
        );
      })}
    </div>
   </div>
  );
};