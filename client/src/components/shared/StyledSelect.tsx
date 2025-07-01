// カスタムスタイルを適用したセレクトボックス用のスタイル定義。
// styled-components（emotion）を用いて、見た目や挙動を装飾。

import styled from '@emotion/styled';

// セレクトボックス本体のスタイル（active状態に応じて背景や影が変化）
const BaseSelect = styled.select<{ active?: boolean }>`
  font-family: "brandon-grotesque", sans-serif;
  font-weight: 500;
  font-style: normal;
  font-size: 14px;
  background: ${({ active }) =>
    active
      ? 'linear-gradient(135deg, rgba(172, 203, 229, 0.45), rgba(165, 178, 220, 0.74))'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.87), rgb(212, 221, 240))'};
  color: rgba(5, 4, 69, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  box-shadow: ${({ active }) =>
    active
      ? 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
      : '0 6px 10px 0 rgba(31, 38, 135, 0.37)'};
  backdrop-filter: blur(20px);
  appearance: none;
  box-sizing: border-box;

  &:active {
    transform: scale(0.96);
  }

  &:hover {
    background: linear-gradient(135deg, rgba(172, 203, 229, 0.45), rgba(165, 178, 220, 0.74));
  }
`;

// セレクトボックスを囲むラッパー。position: relativeで子要素配置の基準に。
const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

// ドロップダウンメニュー用のスタイル。セレクトボックスの下に表示。
const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 40px); // 少し下に出す
  left: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 10px;
  width: 100%;
  z-index: 99;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

// StyledSelectにWrapperとDropdownMenuをサブコンポーネントとして追加
export const StyledSelect = Object.assign(BaseSelect, {
  Wrapper,
  DropdownMenu,
});