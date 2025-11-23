// [Lib] shared/lib - pitchMaps.ts
// 役割: 共通ユーティリティ/インフラ補助
// 音名を五音音階（メジャー／マイナー）にマッピングするユーティリティ。
// 特定の音をPentatonicスケールに適合させるための変換表を定義する。

// メジャーペンタトニックスケール用のマッピング
export const majorPentatonicMap: { [note: string]: string } = {
    'C': 'C', 'C#': 'D', 'D': 'D', 'D#': 'E', 'E': 'E',
    'F': 'G', 'F#': 'G', 'G': 'G', 'G#': 'A', 'A': 'A',
    'A#': 'C', 'B': 'C',
};

// マイナーペンタトニックスケール用のマッピング
export const minorPentatonicMap: { [note: string]: string } = {
    'C': 'C', 'C#': 'D#', 'D': 'D#', 'D#': 'D#', 'E': 'F',
    'F': 'F', 'F#': 'G', 'G': 'G', 'G#': 'A#', 'A': 'A#',
    'A#': 'A#', 'B': 'C',
};

// クロマチックスケール用の恒等マッピング
export const chromaticMap: { [note: string]: string } = {
    'C': 'C', 'C#': 'C#', 'D': 'D', 'D#': 'D#', 'E': 'E',
    'F': 'F', 'F#': 'F#', 'G': 'G', 'G#': 'G#', 'A': 'A',
    'A#': 'A#', 'B': 'B',
};

// スケールモード別のマッピングセット
export const scalePitchMaps = {
    major: majorPentatonicMap,
    minor: minorPentatonicMap,
    chromatic: chromaticMap,
} as const;
