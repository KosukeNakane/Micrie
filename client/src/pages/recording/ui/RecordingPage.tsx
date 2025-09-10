// アプリの主コンテンツを構成するコンポーネント
// 録音、再生、リアルタイムラベル表示、解析結果表示などの要素を統合

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef } from "react";

import { useGlobalAudio } from "@entities/audio/model/GlobalAudioContext";
import { useTempo } from "@entities/tempo/model/TempoContext";
import { useSegment } from "@entities/segment";
import { RealtimeLabel, useAudioRecorder } from "@features/recording";
import { glassBackground } from "@shared/styles";
// import { ControlPanel } from "@widgets/recording/control-panel";
import { TopPlaybackBar } from "@widgets/top-playback-bar";
import { WaveformDisplay } from "@widgets/waveform";
import { useNavigate } from "react-router-dom";

export const RecordingPage = () => {

  const engine = useGlobalAudio();

  // 録音状態・音声データ・リアルタイムラベルを管理するカスタムフック
  const {
    toggleRecording,
    audioBlob,
    realtimeLabel,
  } = useAudioRecorder();

  // テンポ（BPM）を取得するカスタムフック
  const { tempo } = useTempo();
  const { rhythmSegments, melodySegments } = useSegment();
  const navigate = useNavigate();
  const hasNavigatedRef = useRef(false);

  // 音声分析が完了し、Flaskサーバーから結果が返ったらEditへ自動遷移
  useEffect(() => {
    if (hasNavigatedRef.current) return;
    const hasResults = (rhythmSegments?.length ?? 0) > 0 || (melodySegments?.length ?? 0) > 0;
    if (audioBlob && hasResults) {
      hasNavigatedRef.current = true;
      navigate('/edit');
    }
  }, [audioBlob, rhythmSegments?.length, melodySegments?.length, navigate]);


  // Developer Tools 関連状態は Sidebar に移行

  useEffect(() => {
    (async () => {
      await engine.ensureStarted();
      // 既に読み込み済みなら二重ロードしない。GlobalAudioEngine 側で同一URLはスキップされる想定。
      await engine.loadLoop("/audio/your-loop.wav", { loop: true, volume: 0.8 });
      engine.playLoop();
    })();
    // ★遷移しても鳴り続けさせるため、ここでのクリーンアップで停止はしない
  }, [engine]);

  // 録音の開始・停止をtempoに基づいてトグル
  const handleToggleRecording = () => {
    if (!tempo) return;
    toggleRecording(tempo);
  };

  // 各UIコンポーネントを順にレンダリング
  const centerNudge = css`transform: translateX(-12px);`;
  return (
    <div css={[glassBackground, css`& > *:last-child { margin-bottom: 0 !important; }`]}>
      <RealtimeLabel label={realtimeLabel} />
      <TopPlaybackBar />
      <WaveformDisplay audioBlob={audioBlob} onToggleRecording={handleToggleRecording} />
    </div>
  );
};
