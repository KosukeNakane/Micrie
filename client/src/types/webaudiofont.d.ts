// WebAudioFont ライブラリの型定義ファイル。
// MIDIライクな音声再生をブラウザ上で行うための WebAudioFontPlayer クラスを定義する。

declare module 'webaudiofont' {
  // WebAudioFont を用いて音声を再生するプレイヤークラス
  export class WebAudioFontPlayer {
    // サウンドフォントを読み込むローダー
    loader: any;
    // 再生キュー管理（停止などに使用）
    queue: any;
    // プレイヤーの初期化
    constructor();
    // 指定されたパラメータで音を再生する
    playNote(
      audioContext: AudioContext,
      instr: any,
      when: number,
      pitch: number,
      volume: number,
      duration: number
    ): void;
    // 再生キューをキャンセル（再生中の音を止める）
    cancelQueue(audioContext: AudioContext): void;
  }
}