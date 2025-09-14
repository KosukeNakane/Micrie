// 録音する小節(bar)数を選択するドロップダウン形式のセレクター。
// グローバル状態 barCount を変更する機能を持つ。

import styled from '@emotion/styled';
import { useState } from 'react';

import { useBarCount } from '@entities/bar-count/model/BarCountContext';

import { scalePx, scaleShadow } from '@/shared/lib/scale';

import { RectButton } from './RectButton';


// ドロップダウン全体を囲むコンテナ。position: relative でメニューを内包。
const DropdownContainer = styled.div`
  position: relative;
`;

// 選択肢を表示するドロップダウンメニューのスタイル
const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  font-family: "brandon-grotesque", sans-serif;
  font-weight: 500;
  font-style: normal;
  background: rgba(255, 255, 255, 1);
  box-shadow: ${scaleShadow(0, 8, 32, 0)} rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(${scalePx(19)});
  -webkit-backdrop-filter: blur(${scalePx(19)});
  border-radius: ${scalePx(10)};
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: ${scalePx(4)} ${scalePx(6)};
  z-index: 9999;
`;

// 各バー数選択肢のスタイルとホバー時の挙動
const DropdownItem = styled.div`
  padding: ${scalePx(8)} ${scalePx(12)};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background-color: rgba(200, 200, 255, 0.2);
    border-radius: ${scalePx(6)};
  }
`;

export const BarSelectDropdown = () => {
  // グローバルなバー数状態とその更新関数を取得
  const { barCount, setBarCount } = useBarCount();
  // ドロップダウンの開閉状態を管理
  const [openDropdown, setOpenDropdown] = useState(false);
  const label = `${barCount} ${barCount === 1 ? 'bar' : 'bars'}`;

  return (
    <DropdownContainer>
      {/* 現在のバー数を表示するボタン（クリックでドロップダウンを開閉） */}
      <RectButton
        label={label}
        onClick={() => setOpenDropdown((prev) => !prev)}
        active={openDropdown}
        flexGrow={0}
      />
      {/* ドロップダウンが開いているときに選択肢を表示 */}
      {openDropdown && (
        <DropdownMenu>
          {[1, 2, 4].map((n) => (
            // バー数を選択したとき、状態を更新しドロップダウンを閉じる
            <DropdownItem
              key={n}
              onClick={() => {
                setBarCount(n);
                setOpenDropdown(false);
              }}
            >
              {n} {n === 1 ? 'bar' : 'bars'}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};
