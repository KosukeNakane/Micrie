// ガラス風の背景スタイルを持つ共有エリア用のスタイル付きdivコンポーネント

import styled from '@emotion/styled';

// ガラス風のぼかし・枠線・影・グラデーション背景を含むレイアウトエリア
export const StyledArea = styled.div`
  font-family: "brandon-grotesque", sans-serif;
  font-weight: 500;
  font-style: normal;
  font-size: '14px';
  color: rgba(5, 4, 69, 0.8);


  backdrop-filter: blur( 20px );
  -webkit-backdrop-filter: blur( 20px );
  border-radius: 10px;
  border: 1px solid rgba( 255, 255, 255, 0.18 );
  display: flex;
  justify-content: space-around;
  gap: 8px;
  margin: 10px auto;
  padding: 10px 12px;
  box-shadow: 0 8px 16px 0 rgba( 31, 38, 135, 0.37 );
  

`;