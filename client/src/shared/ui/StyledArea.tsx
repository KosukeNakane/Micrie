// ガラス風の背景スタイルを持つ共有エリア用のスタイル付きdivコンポーネント

import styled from '@emotion/styled';

import { scalePx, scaleShadow } from '@/shared/lib/scale';

// ガラス風のぼかし・枠線・影・グラデーション背景を含むレイアウトエリア
export const StyledArea = styled.div`
  font-family: "brandon-grotesque", sans-serif;
  font-weight: 500;
  font-style: normal;
  font-size: ${scalePx(14)};
  color: rgba(5, 4, 69, 0.8);

  backdrop-filter: blur(${scalePx(20)});
  -webkit-backdrop-filter: blur(${scalePx(20)});
  /* やや白い塗りをベースに追加 */
  background: rgba(255, 255, 255, 0.18);
  border-radius: ${scalePx(10)};
  border: 1px solid rgba( 255, 255, 255, 0.18 );
  display: flex;
  justify-content: space-around;
  gap: ${scalePx(8)};
  margin: ${scalePx(10)} auto;
  padding: ${scalePx(10)} ${scalePx(12)};
  box-shadow: ${scaleShadow(0, 8, 16, 0)} rgba( 31, 38, 135, 0.37 );


`;
