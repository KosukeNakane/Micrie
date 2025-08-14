// Micrie アプリのルートコンポーネント。
// 各種コンテキストプロバイダーで状態を共有しつつ、AppContentを表示する。
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Routes, Route, Navigate } from "react-router-dom";
import { CreateContent } from "./components/CreatePage/CreateContent";
import { RhythmContent } from "./components/RhythmPage/RhythmContent";
import { MelodyContent } from "./components/MelodyPage/MelodyContent.tsx";
import { PlayContent } from "./components/PlayPage/PlayContent";
import { TempoProvider } from "./context/TempoContext";
import { AnalysisModeProvider } from './context/AnalysisModeContext';
import { ModeProvider } from './context/ModeContext';
import { RecordingProvider } from './context/RecordingContext';
import { RecordingUIProvider } from './context/RecordingUIContext';
import { SegmentProvider } from './context/SegmentContext';
import { BarCountProvider } from './context/BarCountContext';
import { ScaleModeProvider } from './context/ScaleModeContext';
import { CountBarsAndBeatsProvider } from './context/CountBarsAndBeatsContext';
import { ChordPatternProvider } from './context/ChordPatternContext';
import { DrumPatternProvider } from './context/DrumPatternContext';

import { EffectsProvider } from './context/EffectsContext.tsx';

import { GlobalAudioProvider } from './context/GlobalAudioContext.tsx';

import { createSystem, defineConfig, defaultConfig, ChakraProvider } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    "html, body": {
      bg: "gray.100",
      color: "gray.800",
    },
  },
});
const system = createSystem(defaultConfig, config);

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
        <ChakraProvider value={system}>
          <GlobalAudioProvider>
            <AnalysisModeProvider>
              <ModeProvider>
                <RecordingProvider>
                  <TempoProvider>
                    <RecordingUIProvider>
                      <SegmentProvider>
                        <BarCountProvider>
                          <ScaleModeProvider>
                            <CountBarsAndBeatsProvider>
                              <ChordPatternProvider>
                                <DrumPatternProvider>
                                  <EffectsProvider>
                                    <Routes>
                                      <Route path="/" element={<Navigate to="/create" replace />} />
                                      <Route path="/create" element={<CreateContent />} />
                                      <Route path="/rhythm" element={<RhythmContent />} />
                                      <Route path="/melody" element={<MelodyContent />} />
                                      <Route path="/play" element={<PlayContent />} />
                                    </Routes>
                                  </EffectsProvider>
                                </DrumPatternProvider>
                              </ChordPatternProvider>
                            </CountBarsAndBeatsProvider>
                          </ScaleModeProvider>
                        </BarCountProvider>
                      </SegmentProvider>
                    </RecordingUIProvider>
                  </TempoProvider>
                </RecordingProvider>
              </ModeProvider>
            </AnalysisModeProvider>
          </GlobalAudioProvider>
        </ChakraProvider>
      </div>
    </div>
  );
};
