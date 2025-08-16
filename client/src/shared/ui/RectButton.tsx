// スタイリング済みの長方形ボタンコンポーネント
// active 状態や柔軟なレイアウト制御に対応

import styled from '@emotion/styled';

// active 状態と flexGrow に応じてスタイルが変化するカスタムボタン
export const StyledButton = styled.button<{
  active?: boolean;
  flexGrow?: number | string;
}>`
  box-sizing: border-box;
  font-family: "brandon-grotesque", sans-serif;
  font-weight: 500;
  font-style: normal;
  font-size:14px;
  flex: ${({ flexGrow }) => flexGrow ?? '0 1 auto'};
  background: ${({ active }) =>
    active
      ? 'linear-gradient(135deg, rgba(172, 203, 229, 0.45), rgba(165, 178, 220, 0.74))'
      : 'linear-gradient(135deg,rgba(255, 255, 255, 0.87),rgb(212, 221, 240))'};
  color: rgba(5, 4, 69, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  transition: background 0.3s ease;
  box-shadow: ${({ active }) =>
    active
      ? 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
      : '0 6px 10px 0 rgba(31, 38, 135, 0.37)'};
  backdrop-filter: blur(20px);

  &:hover {
    ${({ active }) =>
      !active &&
      `background: linear-gradient(135deg, rgba(172, 203, 229, 0.45), rgba(165, 178, 220, 0.74));`}
  }

  &:active {
    transform: scale(0.96);
  }
`;

// ラベルとクリックイベント、状態を受け取り StyledButton を描画するシンプルな UI コンポーネント
export const RectButton = ({
  label,
  active,
  onClick,
  flexGrow,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  flexGrow?: number | string;
}) => {
  return (
    <StyledButton active={active} onClick={onClick} flexGrow={flexGrow}>
      {label}
    </StyledButton>
  );
};

