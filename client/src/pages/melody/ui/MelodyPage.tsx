/** @jsxImportSource @emotion/react */
import { TopNav } from "@widgets/top-nav/ui/TopNav";
import { glassBackground } from "@shared/styles/glassBackground";

export const MelodyPage = () => {
  return (
    <div css={glassBackground}>
      {/* ナビゲーション */}
      <TopNav />
    </div>
  );
};

