/** @jsxImportSource @emotion/react */

import { useEffect } from "react";

import { useGlobalAudio } from "@entities/audio/model/GlobalAudioContext";
import { useEffects, type EffectKey } from "@entities/effects/model/EffectsContext";
import { VerticalFader } from "@features/effects/ui/VerticalFader";
import { glassBackground } from "@shared/styles/glassBackground";
import { TopNav } from "@widgets/top-nav/ui/TopNav";


const LABELS: EffectKey[] = ["CRUSH", "COMB", "FILTER", "REVERB", "DIRTY", "CUTTER"];

const Faders = () => {
  const { effects, setEffect } = useEffects();
  return (
    <div
      css={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 16,
        border: "1px solid rgba(255, 255, 255, 0.18)",
        boxShadow: "0 8px 16px 0 rgba(31, 38, 135, 0.37)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(140,194,209,0.25))",
        padding: 16,
        marginTop: 12,
      }}
    >
      <div css={{ display: "flex", gap: "12px", alignItems: "flex-end", justifyContent: "center" }}>
        {LABELS.map((label) => (
          <VerticalFader
            key={label}
            label={label}
            value={effects[label]}
            onChange={(v) => setEffect(label, v)}
            width={60}
            height={180}
          />
        ))}
      </div>
    </div>
  );
};

export const PlayPage = () => {
  const engine = useGlobalAudio();

  useEffect(() => {
    (async () => {
      await engine.ensureStarted();
      // ここでは停止や切断はしない。画面遷移しても継続再生させるため。
    })();
  }, [engine]);

  return (
    <div css={glassBackground}>
      {/* ナビゲーション */}
      <TopNav />
      <Faders />
    </div>
  );
};
