// ガラス風の背景スタイルを持つ共有エリア用のスタイル付きdivコンポーネント
import styled from '@emotion/styled';

// ガラス風のぼかし・枠線・影・グラデーション背景を含むレイアウトエリア
export const StyledArea = styled.div`
  backdrop-filter: blur( 20px );
  -webkit-backdrop-filter: blur( 20px );
  border-radius: 10px;
  border: 1px solid rgba( 255, 255, 255, 0.18 );
  display: flex;
  justify-content: space-around;
  gap: 8px;
  margin: 10px auto;
  padding: 10px 12px;
  background:'linear-gradient(135deg,rgba(255, 255, 255, 0),rgba(140, 194, 209, 0.73))';
  box-shadow: 0 8px 16px 0 rgba( 31, 38, 135, 0.37 );

`;