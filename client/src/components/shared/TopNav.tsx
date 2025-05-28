// アプリ画面上部に表示されるナビゲーションバーコンポーネント
// 現在のタブ状態を管理し、RectButton で切り替え表示する
import styled from '@emotion/styled';
import { useState } from 'react';
import { RectButton } from './RectButton';

// ナビゲーション全体のスタイリング。ガラス風背景・丸み・影付き
const NavWrapper = styled.div`
  
  backdrop-filter: blur( 20px );
  -webkit-backdrop-filter: blur( 20px );
  border-radius: 10px;
  border: 1px solid rgba( 255, 255, 255, 0.18 );
  display: flex;
  justify-content: space-around;
  gap: 8px;
  margin: 10px auto;
  padding: 10px 12px;
  max-width: 360px;
  background:'linear-gradient(135deg,rgba(255, 255, 255, 0),rgba(140, 194, 209, 0.73))';
  box-shadow: 0 8px 16px 0 rgba( 31, 38, 135, 0.37 );
`;

export const TopNav = () => {
  // 現在アクティブなタブを管理するステート
  const [activeTab, setActiveTab] = useState<'CREATE' | 'RHYTHM' | 'MELODY' | 'PLAY'>('CREATE');
  // ナビゲーションに表示するタブの一覧
  const tabs = ['CREATE', 'RHYTHM', 'MELODY', 'PLAY'];

  return (
    <NavWrapper>
      {/* 各タブに対応する RectButton を動的に生成 */}
      {tabs.map((tab) => (
        <RectButton
          key={tab}
          label={tab}
          active={activeTab === tab}
          onClick={() => setActiveTab(tab as any)}
        />
      ))}
    </NavWrapper>
  );
};