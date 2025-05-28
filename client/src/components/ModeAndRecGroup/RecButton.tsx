// 録音開始・停止を制御する丸型ボタンコンポーネント
// 録音状態に応じてスタイルと動作を変更する
import styled from '@emotion/styled';
import { StyledButton } from '../shared/RectButton';
import { useRecording } from '../../context/RecordingContext';
import { useRecordingUI } from '../../context/RecordingUIContext';

// 録音状態に応じて色・影・押し込み表現が変わるスタイル付き丸型ボタン
const CircularButton = styled(StyledButton)<{ recording: boolean }>`
  border-radius: 50%;
  width: 48px;
  height: 48px;
  padding: 0;
  font-size: 18px;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  background: ${({ recording }) =>
    recording
      ? 'linear-gradient(135deg, rgba(255, 51, 51, 0.8), rgba(255, 80, 80, 0.6))'
      : 'rgba(255, 255, 255, 0.3)'};
  color: ${({ recording }) => (recording ? 'white' : 'black')};
  box-shadow: ${({ recording }) =>
    recording
      ? 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
      : '0 8px 16px rgba(31, 38, 135, 0.37)'};
  transform: ${({ recording }) => (recording ? 'translateY(2px)' : 'none')};
`;

export const RecButton = ({ onClick }: { onClick: () => void }) => {
  const { isRecording } = useRecording();
  const { setPlayheadX, setIsDrawing } = useRecordingUI();

  // ボタンクリック時に録音状態を切り替え、描画フラグや再生位置を更新
  const handleClick = () => {
    onClick(); 

    setTimeout(() => {
      const updatedRecording = !isRecording;
      if (!updatedRecording) {
        setPlayheadX(0);
        setIsDrawing(false);
      } else {
        setIsDrawing(true);
        setPlayheadX(0);
      }
    }, 0);
  };

  // 録音状態に応じてスタイルを変更したボタンを表示
  return (
    <CircularButton recording={isRecording} onClick={handleClick}>
      <span style={{ color: 'currentColor' }}>●</span>
    </CircularButton>
  );
};