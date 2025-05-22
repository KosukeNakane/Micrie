import { useEffect, useRef, useState } from 'react';


type Segment = {
  label: string;
  start: number;
  end: number;
};

//Hooks定義
export const useAudioRecorder = () => {
  
  //状態、参照の定義
  const [isRecording, setIsRecording] = useState(false); //録音状態を保持
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null); //録音生データを保持
  const [segments, setSegments] = useState<Segment[]>([]); //機械学習による分類結果を保持
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);//
  const chunksRef = useRef<Blob[]>([]);//

  //useAudioRecorderを使ってるコンポーネントがアンマウント(画面から消える)されるときに録音を止める
  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop(); //mediaRecorderRef.currentがnullでないとき(録音時)、stop()を呼ぶ
    };
  }, []);

  //録音開始時に実行される関数を定義(全体の母体)
  const startRecording = async (tempo: number) => {
    
    // 4カウント（クリック音）を鳴らす
    const playMetronome = async (tempo: number) => {
      const audioCtx = new AudioContext(); //Web Audio API からオーディオ管理用オブジェクトを呼ぶ
      const interval = (60 / tempo) * 1000; //テンポに応じてインターバルの時間が可変

      for (let i = 0; i < 4; i++) { //4回繰り返す

        //全体の流れとしては
        //[OscillatorNode] → [GainNode] → [スピーカー]
        const osc = audioCtx.createOscillator(); //音を発生させる
        const gain = audioCtx.createGain(); //音量を操作
        osc.frequency.value = 1000; //　音の高さを1000Hzに設定
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime); // 今この瞬間の音量を0.1にする
        osc.connect(gain);//発生した音をgainに送信
        gain.connect(audioCtx.destination);//スピーカーやイヤホンにgainで調整された音を送信
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1); // 再生時間は0.1秒
        await new Promise((res) => setTimeout(res, interval)); //interval ms待ってからresを呼ぶ 呼ばれた瞬間、約束が完了されawaitが待機を終了し次の処理へ(今回の場合次のループへ)
      }

      // audioCtx.close(); // 呼び出さないことで再利用性と動作安定性を確保
    };

    //playMetronome(tempo)の実行が終わるまで、次に進まないようにする
    await playMetronome(tempo);

    //録音用の箱MediaRecorderの準備
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); //音声ストリーム(リアルタイムの音声データを取得)　ブラウザからマイクの許可と取得が終わるまで取得は待たれる
    const mediaRecorder = new MediaRecorder(stream);//streamから録音データMediaRecorder インスタンスを作成
    mediaRecorderRef.current = mediaRecorder;//録音データをRefに保存

    //録音完了後、音声を(chunksRefで)受け取れるようにする
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => { //mediaRecoderに音声データが入るとondataavailableで通知されこの関数が動く
      if (e.data.size > 0) {
        chunksRef.current.push(e.data); //mediaRecoderのデータをchunksRefにどんどん追加
      }
    };

    //録音完了後に実行される関数を準備 (録音データをBlobにまとめる　＆　音声分析)
    mediaRecorder.onstop = () => {
 
      if (chunksRef.current.length > 0) { //録音データがあるかを確認
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });//Blob形式で全体の録音データchunkRefをまとめてblobに保存　audio/webmは（WebM形式の音声データ）
        if (blob.size > 1000) { // ある程度の録音時間があるときだけ
          setAudioBlob(blob);//AudioBlobにblobをいれる

           const formData = new FormData();//HTTP経由でファイルを送信する箱formDataを作成
           formData.append("file", blob);//fileという名前でblobを添付

            fetch("http://127.0.0.1:5000/analyze", {//flaskにHTTP POSTリクエスト送信
             method: "POST",
              body: formData,
            })
             .then((res) => res.json())//flaskからJSONを受取
             .then((data) => {
                console.log("Flaskからの解析結果:", data);
                setSegments(data.segments); //segmentに分類結果を保存
             })
             .catch((err) => {
                console.error("Flaskとの通信失敗:", err); 
             });

        }
      }
    };

    //録音開始
    mediaRecorder.start();
    setIsRecording(true);

    //1小節で録音が自動停止する
    const duration = 240 / tempo; // tempoに応じて録音時間(s)を設定
    setTimeout(() => {
      mediaRecorder.stop();
      setIsRecording(false);
    }, duration * 1000);
  };

  //手動で録音停止するための関数を定義
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return { isRecording, audioBlob, startRecording, stopRecording, segments};
};