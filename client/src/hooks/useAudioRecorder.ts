// メトロノーム付きの録音機能を提供するカスタムフック。
// モード（rhythm / melody）と分析方法（Whisper / teachable）に応じて録音データをFlaskサーバーに送信し、分析結果を SegmentContext に保存する。
import { useEffect, useRef, useState } from 'react';
import { useSegment } from '../context/SegmentContext';
import { useRecording } from '../context/RecordingContext';
import { useTeachableModel } from './useTeachableModel';
import { useAnalysisMode } from '../context/AnalysisModeContext';
import { useMode } from '../context/ModeContext';

const hzToMidi = (hz: number): number => Math.round(69 + 12 * Math.log2(hz / 440));
const midiToNote = (midi: number): string => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const note = noteNames[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
};
const hzToNote = (hz: number): string => {
  if (hz <= 0) return '—';
  const midi = hzToMidi(hz);
  return midiToNote(midi);
};

const appendSilenceToBlob = async (originalBlob: Blob, sampleRate: number, durationSec: number): Promise<Blob> => {
  const audioCtx = new AudioContext();
  const buffer = audioCtx.createBuffer(1, sampleRate * durationSec, sampleRate);
  const silentBlob = await new Promise<Blob>((resolve) => {
    const dest = audioCtx.createMediaStreamDestination();
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(dest);
    source.start();
    const recorder = new MediaRecorder(dest.stream);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: 'audio/webm' }));
    };
    recorder.start();
    setTimeout(() => recorder.stop(), durationSec * 1000);
  });
  return new Blob([originalBlob, silentBlob], { type: 'audio/webm' });
};

export type Segment = {
  label: string;
  start: number;
  end: number;
  hz?: number;
  note?: string;
  confidence?: number;
  rms?: number;
  confidence_rms?: number;
};


export const useAudioRecorder = () => {
  
 
  const { isRecording, setIsRecording } = useRecording(); 
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const { setRhythmSegments, setMelodySegments } = useSegment();
  const realtimeLabel = useTeachableModel();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number | null>(null);
  const { Amode } = useAnalysisMode();  
  const { mode } = useMode();
  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop(); 
    };
  }, []);


  // 録音を開始し、メトロノーム後にMediaRecorderで録音。
  // 停止後はモードと分析手法に応じてFlaskに送信し、セグメントを処理する。
  const startRecording = async (tempo: number) => {
    const playMetronome = async (tempo: number) => {
      const audioCtx = new AudioContext();
      const interval = (60 / tempo) * 1000; 
      for (let i = 0; i < 4; i++) { 

        const osc = audioCtx.createOscillator(); 
        const gain = audioCtx.createGain(); 
        osc.frequency.value = 1000; //　音の高さを1000Hzに設定
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime); // 音量を0.1に設定
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1); // 再生時間は0.1秒
        await new Promise((res) => setTimeout(res, interval)); 
      }
    };

    await playMetronome(tempo);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); //音声ストリーム(リアルタイムの音声データを取得)　
    const mediaRecorder = new MediaRecorder(stream);//streamから録音データMediaRecorder インスタンスを作成
    mediaRecorderRef.current = mediaRecorder;//録音データをRefに保存
    recordingStartTimeRef.current = Date.now();
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => { 
      if (e.data.size > 0) {
        chunksRef.current.push(e.data); 
      }
    };
    mediaRecorder.onstop = () => {
 
      if (chunksRef.current.length > 0) { 
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size > 1000) { 
          setAudioBlob(blob);
         
         if (mode === 'rhythm') {
          if (Amode === 'whisper'){
           const formData = new FormData();
           formData.append("file", blob);
           formData.append("tempo", tempo.toString());

            fetch("http://localhost:5172/analyze", {// Whisper分析
             method: "POST",
              body: formData,
            })
             .then((res) => {
               if (!res.ok) throw new Error("サーバーエラー: " + res.status);
               return res.json();
               })
             .then((data) => {
                setRhythmSegments(data.segments); 
             })
             .catch((err) => {
                console.error("Flaskとの通信失敗:", err); 
             });
            }
            else if (Amode === 'keras') {
              const formData = new FormData();
              formData.append("file", blob);
              formData.append("tempo", tempo.toString());
              fetch("http://localhost:5172/predict", {// Keras分析
                method: "POST",
                body: formData,
              })
                .then((res) => res.json())
                .then((data) => {
                  if (Array.isArray(data.segments)) {
                    const parsedSegments = data.segments.map((seg: any) => ({
                      label: seg.label,
                      start: seg.start,
                      end: seg.end
                    }));
                    setRhythmSegments(parsedSegments); 
                  } else {
                    console.warn("推論結果が配列ではありません:", data);
                  }
                })
                .catch((err) => {
                  console.error("推論エラー:", err);
                });
            }
          }
           else if (mode === 'melody') {
              const formData = new FormData();
              formData.append("file", blob);
              formData.append("tempo", tempo.toString()); 

              fetch("http://localhost:5172/pitch", {
              method: "POST",
              body: formData,
             })
              .then((res) => {
                if (!res.ok) throw new Error("サーバーエラー: " + res.status);
                return res.json();
              })
              .then((data) => {
                const totalDuration = 240 / tempo;
                const chunkDuration = totalDuration / data.pitch_series.length;
                const segments = data.pitch_series.map((seg: any, index: number) => {
                  const start = chunkDuration * index;
                  const end = chunkDuration * (index + 1);

                  if (typeof seg === 'string' && seg === 'rest') {
                    return {
                      label: 'rest',
                      start,
                      end,
                    };
                  } else if (
                    typeof seg === 'object' &&
                    seg !== null &&
                    typeof seg.hz === 'number' &&
                    seg.hz > 0
                  ) {
                    const hz = seg.hz;
                    const note = hzToNote(hz);
                    return {
                      label: note,
                      hz,
                      note,
                      start,
                      end,
                      confidence: seg.confidence,
                      rms: seg.rms,
                      confidence_rms: seg.confidence_rms,
                    };
                  } else {
                    return {
                      label: '—',
                      start,
                      end,
                      confidence: seg.confidence,
                      rms: seg.rms,
                      confidence_rms: seg.confidence_rms,
                    };
                  }
                });
                setMelodySegments(segments);
              })
              .catch((err) => {
                console.error("Pitch解析エラー:", err);
              });
            }
        }
      } 
    };
    mediaRecorder.start();
    setIsRecording(true);
    const duration = 240 / tempo;
    setTimeout(() => {
      mediaRecorder.stop();
      setIsRecording(false);
    }, duration * 1000);
  };
  // 録音を停止し、必要に応じて無音を追加。音声Blobを更新する。
  const stopRecording = async (tempo: number) => {
    if (!mediaRecorderRef.current) return;

    const expectedDuration = 240 / tempo;
    const stopTime = Date.now();
    const startTime = recordingStartTimeRef.current ?? stopTime;
    const actualDuration = (stopTime - startTime) / 1000;
    const remaining = expectedDuration - actualDuration;

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      if (blob.size > 1000) {
        const finalBlob = remaining > 0
          ? await appendSilenceToBlob(blob, 44100, remaining)
          : blob;
        setAudioBlob(finalBlob);
      }
      setIsRecording(false);
    };

    mediaRecorderRef.current.stop();
  };
  // 録音の開始・停止をトグルする（isRecording の状態に応じて分岐）
  const toggleRecording = (tempo: number) => {
    if (isRecording) {
      stopRecording(tempo);
    } else {
      startRecording(tempo);
    }
  };

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    toggleRecording,
    realtimeLabel
  };
};