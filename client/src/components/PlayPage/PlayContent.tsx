/** @jsxImportSource @emotion/react */

import { TopNav } from "../TopNav";
import { glassBackground } from "../../styles/glassBackground";
import { VerticalFader } from "./VerticalFader/VerticalFader";
import { useEffects, type EffectKey } from "../../context/EffectsContext";

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

export const PlayContent = () => {
  return (
    <div css={glassBackground}>
      {/* ナビゲーション */}
      <TopNav />
      <Faders />
    </div>
  );
};