import styled from '@emotion/styled';
import MicIcon from '@mui/icons-material/Mic';
import TuneIcon from '@mui/icons-material/Tune';
import { useNavigate } from 'react-router-dom';

import { StyledArea } from '@shared/ui/StyledArea';


// SVG は SVGR を使用して React コンポーネントとして読み込む
import PerformanceIcon from '@/assets/icons/performance-icon.svg?react';
import { scalePx } from '@/shared/lib/scale';

// ガラス風のナビゲーションバー（全体コンテナ）
const NavBarArea = styled(StyledArea)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${scalePx(12)}; /* 各アイコン間隔 */
  box-sizing: border-box;
  width: ${scalePx(366)};
  height: ${scalePx(94)};
  padding: ${scalePx(12)}; /* 外枠の内側余白 */
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(255,255,255,0.35), rgba(140,194,209,0.25));
`;

// 各アイコンを囲うコンテナ（71x71）
const IconTile = styled(StyledArea)`
  box-sizing: border-box;
  width: ${scalePx(71)};
  height: ${scalePx(71)};
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255,255,255,0.55), rgba(140,194,209,0.35));
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.05s ease;
  &:hover { background-color: rgba(255, 255, 255, 0.38); }
  &:active { transform: translateY(1px); }
  /* 既定のアイコンサイズ（MUI/SVGRの1emに効く） */
  & > svg { font-size: ${scalePx(36)}; color: rgba(5, 4, 69, 0.9); }
`;

export const NavBar = () => {
  const navigate = useNavigate();
  // SVGの色を強制的に上書き（元SVGが固定色のため）
  const PerformanceColored = styled(PerformanceIcon)`
    width: ${scalePx(36)};
    height: ${scalePx(36)};
    & path { fill: rgba(5, 4, 69, 0.9) !important; }
  `;
  return (
    <NavBarArea>
      {/* 左から Mic, Tune, Performance（SVG） の順 */}
      <IconTile as="button" aria-label="record" onClick={() => navigate('/recording')}>
        <MicIcon sx={{ fontSize: 36 }} />
      </IconTile>
      <IconTile as="button" aria-label="tune" onClick={() => navigate('/edit')}>
        <TuneIcon sx={{ fontSize: 36 }} />
      </IconTile>
      <IconTile as="button" aria-label="performance" onClick={() => navigate('/performance')}>
        <PerformanceColored />
      </IconTile>
    </NavBarArea>
  );
};

export default NavBar;
