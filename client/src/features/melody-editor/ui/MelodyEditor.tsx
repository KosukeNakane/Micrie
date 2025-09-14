import React from 'react';
import type { FC } from 'react';
import { MelodyEditorUI } from './MelodyEditorUI';
type Props = { barIndex: number; width?: number };

// 互換用の薄いラッパー。既存の MelodySegmentEditor をそのまま利用します。
export const MelodyEditor: FC<Props> = (props) => {
  return <MelodyEditorUI />;
};

