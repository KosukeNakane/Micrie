/** @jsxImportSource @emotion/react */
import { TopNav } from "../TopNav";
import { glassBackground } from "../../styles/glassBackground";

export const RhythmContent = () => {

  return (
    <div css={glassBackground}>
      {/* ナビゲーション */}
      <TopNav />
    </div>
  );
};