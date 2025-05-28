// Micrie アプリのルートコンポーネント。
// 各種コンテキストプロバイダーで状態を共有しつつ、AppContentを表示する。
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { AppContent } from "./components/AppContent";
import { TempoProvider } from "./context/TempoContext";
import { AnalysisModeProvider } from './context/AnalysisModeContext';
import { ModeProvider } from './context/ModeContext';
import { RecordingProvider } from './context/RecordingContext';
import { RecordingUIProvider } from './context/RecordingUIContext';
import { SegmentProvider } from './context/SegmentContext';

export const App = () => {

 // アプリ全体のベーススタイル（背景ぼかし含むレイヤー構成）
 const appStyle = css`
  position: relative;
  min-height: 100vh;
  overflow: hidden;
 `;

 /* ぼかしフィルター付きの背景画像 */
 const backgroundStyle = css`
  position: absolute;
  inset: 0;
  background-image: url(/background.jpg);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(50px);
  z-index: 0;
 `;

 /* 背景の上に重ねるUIのコンテンツレイヤー */
 const contentStyle = css`
  position: relative;
  z-index: 1;
 `;

 return (
  <div css={appStyle}>
   <div css={backgroundStyle} />
   <div css={contentStyle}>
    {/* アプリ全体に渡す状態管理のコンテキストプロバイダー群 + AppContent */}
    <AnalysisModeProvider>
    <ModeProvider>
    <RecordingProvider>
      <TempoProvider>
      <RecordingUIProvider>
      <SegmentProvider> 
        <AppContent/>
      </SegmentProvider> 
      </RecordingUIProvider>
      </TempoProvider>
    </RecordingProvider>
    </ModeProvider>
    </AnalysisModeProvider>
   </div>
  </div>
 );
};
