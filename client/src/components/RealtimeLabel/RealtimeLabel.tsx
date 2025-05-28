// 現在認識されている音声ラベルを画面右上に表示するコンポーネント
import styled from '@emotion/styled';
import { useMode } from "../../context/ModeContext";

// コンポーネントに渡される props の型定義（label は null または文字列）
type Props = {
  label: string | null;
};

// StyledArea をベースにしたラベル用スタイル
const SegmentLabel = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, rgba(255, 248, 56, 0.76), rgb(255, 210, 97));
  font-family: "brandon-grotesque", sans-serif;
  font-size: 16px;
  padding: 0px 4px;
  border-radius: 4px;
  z-index: 999;
  color: #333;
`;

export const RealtimeLabel = ({ label }: Props) => {
  const { mode } = useMode();

  if (!label || mode !== "rhythm") return null;

  return <SegmentLabel>Current Sound: {label}</SegmentLabel>;
};
