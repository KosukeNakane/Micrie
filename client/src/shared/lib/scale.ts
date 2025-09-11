// UIスケール用のユーティリティ（固定係数でpxを縮小）
export const UI_SCALE = 1;

// px値を固定スケールしたpx文字列に変換
export const scalePx = (px: number) => `${px * UI_SCALE}px`;

// 影など複数の長さを含むプロパティ用のヘルパ（固定スケール）
export const scaleShadow = (x: number, y: number, blur: number, spread = 0) =>
  `${x * UI_SCALE}px ${y * UI_SCALE}px ${blur * UI_SCALE}px ${spread * UI_SCALE}px`;
