/** @jsxImportSource @emotion/react */

import { useEffect } from "react";

import { useGlobalAudio } from "@entities/audio/model/GlobalAudioContext";
import { useEffects, type EffectKey } from "@entities/effects/model/EffectsContext";
import { VerticalFader } from "@features/effects/ui/VerticalFader";
import { useEffectsUiStore } from "@/features/effects";
import EffectsButton from "@features/effects/ui/EffectsButton";
import { glassBackground } from "@shared/styles/glassBackground";
import EffectsPanel from "@features/effects/ui/EffectsPanel";
import SplitHoldResetButton from "@features/effects/ui/SplitHoldResetButton";
import { TopPlaybackBar } from "@widgets/top-playback-bar";
import { useChannelsStore } from "@/entities/audio/model/useChannelsStore";


const LABELS: EffectKey[] = ["CRUSH", "COMB", "HICUT", "LOWCUT", "REVERB", "DIRTY"];

type FadersProps = { springBack: boolean };
const Faders = ({ springBack }: FadersProps) => {
  const { effects, setEffect } = useEffects();
  const holdAll = useEffectsUiStore((s) => s.hold);
  const holdBy = useEffectsUiStore((s) => s.holdByKey);
  const toggleHoldFor = useEffectsUiStore((s) => s.toggleHoldFor);

  return (
    <div css={{ display: 'flex', gap: '12px', alignItems: 'flex-end', justifyContent: 'center' }}>
      {LABELS.map((label) => {
        const isHeld = !!holdAll || !!holdBy[label];
        const faderSpringBack = springBack && !isHeld; // 全体指定に対し、HOLD（全体/個別）が有効ならスプリングバック無効
        return (
          <div key={label} css={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <VerticalFader
              label={label}
              value={effects[label]}
              onChange={(v) => setEffect(label, v)}
              springBack={faderSpringBack}
              width={60}
              height={180}
            />
            <SplitHoldResetButton
              width={60}
              height={64}
              holdActive={isHeld}
              onToggleHold={() => toggleHoldFor(label)}
              onReset={() => setEffect(label, 0)}
            />
          </div>
        );
      })}
    </div>
  );
};

export const PerformancePage = () => {
  const engine = useGlobalAudio();
  const hold = useEffectsUiStore((s) => s.hold);
  const toggleHold = useEffectsUiStore((s) => s.toggleHold);
  const { setEffect, setMany } = useEffects();
  const melodyMuted = useChannelsStore((s) => s.melodyMuted);
  const drumMuted = useChannelsStore((s) => s.drumMuted);
  const chordMuted = useChannelsStore((s) => s.chordMuted);
  const toggleMuted = useChannelsStore((s) => s.toggleMuted);

  const resetAll = () => {
    LABELS.forEach((label) => setEffect(label, 0));
  };

  const randomAll = () => {
    const patch: Partial<Record<EffectKey, number>> = {};
    LABELS.forEach((label) => { patch[label] = Math.random(); });
    setMany(patch);
  };

  useEffect(() => {
    (async () => {
      await engine.ensureStarted();
      // ここでは停止や切断はしない。画面遷移しても継続再生させるため。
      // ストアのミュート状態をエンジンへ同期
      await engine.setChannelMuted('melody', melodyMuted);
      await engine.setChannelMuted('drum', drumMuted);
      await engine.setChannelMuted('chord', chordMuted);
    })();
  }, [engine]);

  // ミュート状態が変わったらエンジンに反映
  useEffect(() => { engine.setChannelMuted('melody', melodyMuted); }, [engine, melodyMuted]);
  useEffect(() => { engine.setChannelMuted('drum', drumMuted); }, [engine, drumMuted]);
  useEffect(() => { engine.setChannelMuted('chord', chordMuted); }, [engine, chordMuted]);

  return (
    <div>
      {/* 再生バー */}
      <TopPlaybackBar />

      <EffectsPanel>

        <div
          css={{
            display: "flex",
            justifyContent: "center",
            // alignItems: "center",
            gap: 12,
          }}
        >
          {/* 左側：RANDOM ALL（右側ボタン列と同じ幅・UI） */}
          <div css={{ display: "flex", flexDirection: "column", gap: 12, alignItems: 'center', width: 60 }}>
            <EffectsButton label="RAND ALL" size={120} width={60} onClick={randomAll} />
            <EffectsButton label="MELODY" size={32} width={60} active={melodyMuted} onClick={() => toggleMuted('melody')} />
            <EffectsButton label="CHORD" size={32} width={60} active={chordMuted} onClick={() => toggleMuted('chord')} />
            <EffectsButton label="DRUM" size={32} width={60} active={drumMuted} onClick={() => toggleMuted('drum')} />
          </div>
          <Faders springBack={!hold} />
          <div css={{ display: "flex", flexDirection: "column", gap: 12, alignItems: 'center', width: 60 }}>
            <EffectsButton label="HOLD ALL" size={120} width={60} active={hold} onClick={toggleHold} />
            <EffectsButton label="RESET ALL" size={120} width={60} onClick={resetAll} />
          </div>
        </div>
      </EffectsPanel>
    </div >
  );
};
