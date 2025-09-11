/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { glassBackground } from "@shared/styles/glassBackground";
import { TopPlaybackBar } from "@widgets/top-playback-bar";
import { BarWaveformSection } from "@widgets/waveform";
import { StyledArea } from "@shared/ui";
import { ScaleModeSelect } from "@features/scale-mode";
import { ChordPatternSelect, DrumPatternSelect } from "@features/pattern-select";
import { SimpleSelect } from "@shared/ui";

// レイアウト用のStyledArea派生コンポーネント
const ControlsPanel = styled(StyledArea)`
  display: grid;
  grid-template-columns: 120px 1fr 160px;
  grid-auto-rows: minmax(36px, auto);
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  max-width: 600px;
`;

// 旧 RHYTHM / MELODY ページを統合した編集ページ
// 既存の機能はそのままで、上部ナビは NavBar に移行済み
export const EditPage = () => {
  return (
    <div>
      <TopPlaybackBar />
      {/* コントロール群（StyledAreaベース） */}
      <ControlsPanel>
        {/* Row 1 */}
        <span style={{ fontSize: 12, color: 'rgba(5,4,69,0.8)' }}>Scale/Mode</span>
        <div><ScaleModeSelect /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'rgba(5,4,69,0.8)' }}>Sound:</span>
          <div style={{ width: 110 }}>
            <SimpleSelect
              options={[
                { value: 'default', label: 'Default' },
                { value: 'bright', label: 'Bright' },
                { value: 'warm', label: 'Warm' },
              ]}
              value={{ value: 'default', label: 'Default' }}
              onChange={() => { /* プレースホルダー: 後で接続 */ }}
            />
          </div>
        </div>

        {/* Row 2 */}
        <span style={{ fontSize: 12, color: 'rgba(5,4,69,0.8)' }}>Chord</span>
        <div><ChordPatternSelect /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'rgba(5,4,69,0.8)' }}>Sound:</span>
          <div style={{ width: 110 }}>
            <SimpleSelect
              options={[
                { value: 'default', label: 'Default' },
                { value: 'bright', label: 'Bright' },
                { value: 'warm', label: 'Warm' },
              ]}
              value={{ value: 'default', label: 'Default' }}
              onChange={() => { /* プレースホルダー: 後で接続 */ }}
            />
          </div>
        </div>

        {/* Row 3 */}
        <span style={{ fontSize: 12, color: 'rgba(5,4,69,0.8)' }}>Drum</span>
        <div><DrumPatternSelect /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'rgba(5,4,69,0.8)' }}>Kit:</span>
          <div style={{ width: 110 }}>
            <SimpleSelect
              options={[
                { value: 'std', label: 'Standard' },
                { value: '808', label: 'TR-808' },
                { value: '909', label: 'TR-909' },
              ]}
              value={{ value: 'std', label: 'Standard' }}
              onChange={() => { /* プレースホルダー: 後で接続 */ }}
            />
          </div>
        </div>
      </ControlsPanel>

      {/* 位置変更後の波形セクション */}
      <BarWaveformSection />
    </div>
  );
};
