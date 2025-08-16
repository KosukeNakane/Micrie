// 録音開始・停止を制御する丸型ボタンコンポーネント
// 録音状態に応じてスタイルと動作を変更する

import styled from '@emotion/styled';

import { useRecording } from '@entities/audio/model/RecordingContext';
import { useRecordingUI } from '@entities/audio/model/RecordingUIContext';
import { useBarCount } from '@entities/bar-count/model/BarCountContext';
import { useCountBarsAndBeats } from '@entities/count-bars-and-beats/model/CountBarsAndBeatsContext';
import { useTempo } from '@entities/tempo/model/TempoContext';
import { StyledButton } from '@shared/ui/RectButton';

// 録音状態に応じて色・影・押し込み表現が変わるスタイル付き丸型ボタン
const CircularButton = styled(StyledButton)<{ recording: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  padding: 0 16px;
  height: 48px;
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

  &:hover {
    background: linear-gradient(135deg, rgba(255, 51, 51, 0.8), rgba(255, 80, 80, 0.6));
  }
`;

export const RecButton = ({ onClick }: { onClick: () => void }) => {
  const { isRecording } = useRecording();
  const { setIsDrawing } = useRecordingUI();
  const { tempo } = useTempo();
  const { barCount } = useBarCount();
  const { setCurrentBar, setCurrentBeat } = useCountBarsAndBeats();

  // ボタンクリック時に録音状態を切り替え、描画フラグや再生位置を更新
  const handleClick = async () => {
    onClick();

    setTimeout(() => {
      const updatedRecording = !isRecording;
      if (!updatedRecording) {
        setIsDrawing(false);
      } else {
        setIsDrawing(true);
      }
    }, 0);

    const playMetronome = async (tempo: number) => {
      const audioCtx = new AudioContext();
      const intervalSec = 60 / tempo;
      const btLatencySec = 0.0;
      const totalBeats = barCount * 4 + 4;

      for (let i = 0; i < totalBeats; i++) {
        const delay = (btLatencySec + i * intervalSec) * 1000;

        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.value = 1000;
          gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.1);

          const bar = Math.floor(i / 4);
          const beat = (i % 4) + 1;
          setCurrentBar(bar);
          setCurrentBeat(beat);
        }, delay);
      }

      await new Promise((res) => setTimeout(res, (btLatencySec + intervalSec * totalBeats) * 1000));
    };

    await playMetronome(tempo);

    setCurrentBar(0);
    setCurrentBeat(0);
  };

  // 録音状態に応じてスタイルを変更したボタンを表示
  return (
    <CircularButton recording={isRecording} onClick={handleClick}>
      <span
        style={{
          fontFamily: 'brandon-grotesque, sans-serif',
          fontWeight: 500,
          fontStyle: 'normal',
          fontSize: '20px',
          color: 'rgba(5, 4, 69, 0.8)'
        }}
      >
        REC ●
      </span>
    </CircularButton>
  );
};

