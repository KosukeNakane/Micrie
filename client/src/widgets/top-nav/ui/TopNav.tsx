// アプリ画面上部に表示されるナビゲーションバーコンポーネント
// 現在のタブ状態を管理し、RectButton で切り替え表示する

import styled from '@emotion/styled';
import { useNavigate, useLocation } from 'react-router-dom';
import { RectButton } from '@shared/ui/RectButton';

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
  const navigate = useNavigate();
  const location = useLocation();
  // ナビゲーションに表示するタブの一覧
  const tabs = ['CREATE', 'RHYTHM', 'MELODY', 'PLAY'];

  return (
    <NavWrapper>
      {/* 各タブに対応する RectButton を動的に生成 */}
      {tabs.map((tab) => (
        <RectButton
          key={tab}
          label={tab}
          active={
            (tab === 'CREATE' && location.pathname === '/create') ||
            (tab === 'RHYTHM' && location.pathname === '/rhythm') ||
            (tab === 'MELODY' && location.pathname === '/melody') ||
            (tab === 'PLAY' && location.pathname === '/play')
          }
          onClick={() => {
            if (tab === 'CREATE') navigate('/create');
            else if (tab === 'RHYTHM') navigate('/rhythm');
            else if (tab === 'MELODY') navigate('/melody');
            else if (tab === 'PLAY') navigate('/play');
          }}
        />
      ))}
    </NavWrapper>
  );
};
