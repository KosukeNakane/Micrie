import styled from '@emotion/styled';
import { StyledArea } from '@shared/ui/StyledArea';
import MicIcon from '@mui/icons-material/Mic';
import TuneIcon from '@mui/icons-material/Tune';
// SVG は SVGR を使用して React コンポーネントとして読み込む
import PerformanceIcon from '@/assets/icons/performance-icon.svg?react';

// ガラス風のナビゲーションバー（全体コンテナ）
const NavBarArea = styled(StyledArea)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px; /* 各アイコン間隔 */
  box-sizing: border-box;
  width: 366px;
  height: 94px;
  padding: 12px; /* 外枠の内側余白 */
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(255,255,255,0.35), rgba(140,194,209,0.25));
`;

// 各アイコンを囲うコンテナ（71x71）
const IconTile = styled(StyledArea)`
  box-sizing: border-box;
  width: 71px;
  height: 71px;
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
  & > svg { font-size: 36px; color: rgba(5, 4, 69, 0.9); }
`;

export const NavBar = () => {
  // SVGの色を強制的に上書き（元SVGが固定色のため）
  const PerformanceColored = styled(PerformanceIcon)`
    width: 36px;
    height: 36px;
    & path { fill: rgba(5, 4, 69, 0.9) !important; }
  `;
  return (
    <NavBarArea>
      {/* 左から Mic, Tune, Performance（SVG） の順 */}
      <IconTile as="button" aria-label="record">
        <MicIcon sx={{ fontSize: 36 }} />
      </IconTile>
      <IconTile as="button" aria-label="tune">
        <TuneIcon sx={{ fontSize: 36 }} />
      </IconTile>
      <IconTile as="button" aria-label="performance">
        <PerformanceColored />
      </IconTile>
    </NavBarArea>
  );
};

export default NavBar;
