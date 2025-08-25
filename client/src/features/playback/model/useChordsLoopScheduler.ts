// コード進行ループのインデックス管理を行うカスタムフック。
// 一定テンポで現在のコード位置を更新し、他コンポーネントで参照できるようにする。

import { useEffect, useRef } from 'react';

import { useTempo } from '@entities/tempo/model/TempoContext';

export const useChordsLoopScheduler = (isChordsPlaying: boolean) => {
    const { tempo } = useTempo();

    // コード配列の長さ（ステップ数）に合わせてループ範囲を設定
    const chordsLength = 16; // 元のコードのchords配列の長さに合わせる
    // コード1つあたりの再生時間（秒）をテンポから計算
    const chordDuration = 30 / tempo;
    // setInterval用にミリ秒に変換
    const beatDuration = chordDuration * 1000;

    // setIntervalのIDを保持（解除のために使用）
    const intervalRef = useRef<number | null>(null);
    // 現在のコードインデックスを保持
    const currentChordIndexRef = useRef(0);

    useEffect(() => {
        // コード再生中であれば一定間隔でインデックスを更新
        if (isChordsPlaying) {
            intervalRef.current = window.setInterval(() => {
                // ここでループ処理を行う（再生処理は削除）
                currentChordIndexRef.current = (currentChordIndexRef.current + 1) % chordsLength;
            }, beatDuration);
        } else {
            // 再生停止またはアンマウント時にインターバルを解除
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                currentChordIndexRef.current = 0;
            }
        }

        // 再生停止またはアンマウント時にインターバルを解除
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isChordsPlaying, tempo]);
};
