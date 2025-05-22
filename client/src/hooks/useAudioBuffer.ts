/* このファイルの役割
録音された音声（audioBlob）を、React内で
再生・波形描画に使える形（AudioBuffer）に変換して管理する
*/
import { useEffect, useState } from 'react';

export const useAudioBuffer = (audioBlob: Blob | null) => {

  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  /*useEffectでaudioBlobに変化があるとif、、、が実行される
    ifの中身は下に詳しく書いてるけど
    まとめると、audioBlobに値が入っている場合に、その値を便利な形式に変換して
    audioBufferに入れてくれる
  */
  useEffect(() => {

    /*まだ audioBlob が無いときは、処理を実行しない」というチェック*/
    if (!audioBlob) return;
    
    /* decodeっていう関数の定義
       この関数はaudioBlobをAudioBufferという便利な形式に変換して
       audioBufferという変数に格納してくれる変換器
    */
    const decode = async () => {

      const audioCtx = new AudioContext();

      /* 録音データ audioBlob を「バイナリ配列（ArrayBuffer）」に変換
		 Blob はそのままだと中身が読めないから、.arrayBuffer() で中身を展開*/
      const arrayBuffer = await audioBlob.arrayBuffer();

      /* arrayBufferをdecodeAudioData()に投げることでWeb Audio APIが
         理解できる形式(AudioBufferという形式)に変換してくれる*/
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      
      /*変換後のデータをaudioBufferに格納*/
      setAudioBuffer(decoded);
    };
    
    decode();
  }, [audioBlob]);

  //変換後のデータであるaudioBufferを返す
  return audioBuffer;
};