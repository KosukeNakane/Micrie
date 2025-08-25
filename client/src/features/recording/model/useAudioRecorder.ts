// メトロノーム付きの録音機能を提供するカスタムフック。
// モード（rhythm / melody）と解析方法（Whisper / teachable）に応じて録音データをFlaskサーバーに送信し、解析結果を SegmentContext に保存する。

// 1. startRecording: 録音を開始し、録音後にFlaskサーバーへ送信して解析する
// 2. stopRecording: 録音を手動停止し、不足時間に無音を追加する
// 3. toggleRecording: 録音の開始/停止をトグルする

import { useEffect, useRef, useState } from 'react';

import { useAnalysisMode } from '@entities/analysis/model/AnalysisModeContext';
import { useRecording } from '@entities/audio/model/RecordingContext';
import { useBarCount } from '@entities/bar-count/model/BarCountContext';
import { useMode } from '@entities/mode/model/ModeContext';
import { useSegment } from '@entities/segment/model/SegmentContext';
import { useTeachableModel } from '@features/analysis/model/useTeachableModel';
import { apiFetch } from '@shared/api/apiClient';

// 音声Blobの末尾に無音を追加して、期待される録音時間に調整する
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
    const { barCount } = useBarCount();
    useEffect(() => {
        return () => {
            mediaRecorderRef.current?.stop();
        };
    }, []);


    // 録音を開始し、メトロノーム後にMediaRecorderで録音。
    // 停止後はモードと解析手法に応じてFlaskに送信し、セグメントを処理する。
    const startRecording = async (tempo: number) => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        // 録音終了後の処理：Blob生成、モードと解析方法に応じたサーバー送信とセグメント保存
        mediaRecorder.onstop = () => {
            if (chunksRef.current.length > 0) {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                if (blob.size > 1000) {
                    setAudioBlob(blob);
                    if (mode === 'rhythm') {
                        if (Amode === 'whisper') {
                            const formData = new FormData();
                            formData.append("file", blob);
                            formData.append("tempo", tempo.toString());
                            formData.append("bar_count", barCount.toString());
                            apiFetch("analyze", {
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
                        } else if (Amode === 'keras') {
                            const formData = new FormData();
                            formData.append("file", blob);
                            formData.append("tempo", tempo.toString());
                            formData.append("bar_count", barCount.toString());
                            apiFetch("predict", {
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
                    } else if (mode === 'melody') {
                        const formData = new FormData();
                        formData.append("file", blob);
                        formData.append("tempo", tempo.toString());
                        formData.append("bar_count", barCount.toString());
                        apiFetch("pitch", {
                            method: "POST",
                            body: formData,
                        })
                            .then((data) => {
                                console.log("Pitch API response:", data);
                                if (!data || !Array.isArray(data.pitch_series)) {
                                    throw new Error("Pitch APIのレスポンス形式が不正です");
                                }
                                const totalDuration = (60 / tempo) * 4 * barCount;
                                const chunkDuration = totalDuration / data.pitch_series.length;
                                const segments = data.pitch_series.map((seg: any, index: number) => {
                                    const start = chunkDuration * index;
                                    const end = chunkDuration * (index + 1);

                                    const note = seg.note ?? (seg.label === 'rest' ? 'rest' : 'error');
                                    const label = seg.label ?? (note === 'rest' ? '—' : 'error');

                                    return {
                                        label,
                                        note,
                                        hz: seg.hz,
                                        start,
                                        end,
                                        confidence: seg.confidence,
                                        rms: seg.rms,
                                        confidence_rms: seg.confidence_rms,
                                    };
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

        // メトロノームを鳴らした後、録音を開始し一定時間後に自動停止
        const playMetronomeAndStart = async () => {
            const interval = (60 / tempo) * 1000;
            await new Promise((res) => setTimeout(res, interval * (4.1 - 0.005 * (tempo - 60)))); //rhythm bluetooth 0.0057 | スピーカー 0.002 (経験値) melody bluetooth 0.0067
            console.log(4.4 + (-0.0035) * (tempo - 60))
            console.log((4.4 + (-0.015) * (tempo - 60)))
            recordingStartTimeRef.current = Date.now();
            mediaRecorder.start();
            setIsRecording(true);
            const duration = (60 / tempo) * 4 * barCount;
            setTimeout(() => {
                mediaRecorder.stop();
                setIsRecording(false);
            }, duration * 1000);
        };

        await playMetronomeAndStart();
    };
    // 録音を停止し、必要に応じて無音を追加。音声Blobを更新する。
    const stopRecording = async (tempo: number) => {
        if (!mediaRecorderRef.current) return;

        const expectedDuration = (60 / tempo) * 4 * barCount;
        const stopTime = Date.now();
        const startTime = recordingStartTimeRef.current ?? stopTime;
        const actualDuration = (stopTime - startTime) / 1000;
        const remaining = expectedDuration - actualDuration;

        // stopRecording 時の録音停止後処理：不足時間があれば無音を追加してBlob更新
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
    // 録音の開始と停止をisRecordingの状態に応じて切り替える
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
