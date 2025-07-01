// WebAudioFont を使ったシンセサイザーの初期化を行うカスタムフック。
// AudioContextとWebAudioFontPlayerのインスタンスを生成・返却する。

import { useEffect, useRef } from 'react';

declare const _tone_0000_Aspirin_sf2_file: any;

export const useAudioEngine = () => {
  // AudioContext を保持する参照
  const audioCtxRef = useRef<AudioContext | null>(null);
  // WebAudioFontPlayer インスタンスを保持する参照
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // AudioContext が未初期化の場合に新規作成（Safari 対応も含む）
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }

    // WebAudioFontPlayer が未初期化の場合にインスタンス生成
    if (!playerRef.current) {
      playerRef.current = new (window as any).WebAudioFontPlayer();
    }

    // サウンドフォントファイルを読み込み
    playerRef.current.loader.startLoad(audioCtxRef.current, _tone_0000_Aspirin_sf2_file);
    // 読み込み完了時のコールバックを登録
    playerRef.current.loader.waitLoad(() => {
      console.log('Sound font loaded');
    });
  }, []);

  // AudioContext とプレイヤーを返却
  return {
    audioCtx: audioCtxRef.current,
    player: playerRef.current
  };
};