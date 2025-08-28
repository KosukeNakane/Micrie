/** @jsxImportSource @emotion/react */
import { glassBackground } from "@shared/styles/glassBackground";
import { TopNav } from "@widgets/top-nav/ui/TopNav";
import { TopPlaybackBar } from "@widgets/top-playback-bar";

export const RhythmPage = () => {

  return (
    <div css={glassBackground}>
      {/* ナビゲーション */}
      <TopNav />
      <TopPlaybackBar />
    </div>
  );
};
