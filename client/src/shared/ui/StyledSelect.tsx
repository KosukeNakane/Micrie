// カスタムスタイルを適用したセレクトボックス用のスタイル定義。
// styled-components（emotion）を用いて、見た目や挙動を装飾。

import styled from '@emotion/styled';
import { scalePx, scaleShadow } from '@/shared/lib/scale';

// セレクトボックス本体のスタイル（active状態に応じて背景や影が変化）
const BaseSelect = styled.select<{ active?: boolean }>`
  font-family: "brandon-grotesque", sans-serif;
  font-weight: 500;
  font-style: normal;
  font-size: ${scalePx(14)};
  background: ${({ active }) =>
    active
      ? 'linear-gradient(135deg, rgba(172, 203, 229, 0.45), rgba(165, 178, 220, 0.74))'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.87), rgb(212, 221, 240))'};
  color: rgba(5, 4, 69, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: ${scalePx(10)};
  padding: ${scalePx(8)} ${scalePx(10)};
  cursor: pointer;
  box-shadow: ${({ active }) =>
    active
      ? `${scaleShadow(0, 2, 4)} rgba(0, 0, 0, 0.2)`
      : `${scaleShadow(0, 6, 10, 0)} rgba(31, 38, 135, 0.37)`};
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
  top: calc(100% + 30px); // 少し下に出す
  left: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: ${scalePx(6)};
  padding: ${scalePx(10)};
  width: 100%;
  z-index: 99;
  box-shadow: ${scaleShadow(0, 4, 12)} rgba(0,0,0,0.1);
`;

// StyledSelectにWrapperとDropdownMenuをサブコンポーネントとして追加
export const StyledSelect = Object.assign(BaseSelect, {
  Wrapper,
  DropdownMenu,
});
