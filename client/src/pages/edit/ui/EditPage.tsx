/** @jsxImportSource @emotion/react */
import { glassBackground } from "@shared/styles/glassBackground";
import { TopPlaybackBar } from "@widgets/top-playback-bar";

// 旧 RHYTHM / MELODY ページを統合した編集ページ
// 既存の機能はそのままで、上部ナビは NavBar に移行済み
export const EditPage = () => {
  return (
    <div css={glassBackground}>
      <TopPlaybackBar />
    </div>
  );
};

