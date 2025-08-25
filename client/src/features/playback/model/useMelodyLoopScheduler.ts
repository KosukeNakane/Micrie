// メロディループを制御するカスタムフック
// currentSegments.melody のノート情報を基に、テンポに合わせてTone.jsで繰り返し再生する

import { useRef, useState, useEffect, useMemo } from 'react';

import { useScaleMode } from '@entities/scale-mode/model/ScaleModeContext';
import { useSegment } from '@entities/segment/model/SegmentContext';
import { useTempo } from '@entities/tempo/model/TempoContext';

export const useMelodyLoopScheduler = () => {
    const { scaleMode } = useScaleMode();
    // スケールモードの最新値を保持する参照（再レンダーなしで利用するため）
    const scaleModeRef = useRef(scaleMode);
    useEffect(() => {
        scaleModeRef.current = scaleMode;
    }, [scaleMode]);
    // 現在のメロディセグメントを保持（再レンダーなしでアクセス）
    const segmentsRef = useRef<any[] | null>(null);
    const { loopMode, currentSegments } = useSegment();
    const [isLooping, setIsLooping] = useState(false);
    // ループ中かどうかのフラグを保持（非同期関数内での参照用）
    const isLoopingRef = useRef(false);
    const { tempo } = useTempo();

    useEffect(() => {
        isLoopingRef.current = isLooping;
    }, [isLooping]);

    // テンポに応じて各ノートの長さ（1/2拍）を計算
    const { chunkDuration } = useMemo(() => {
        const beatDuration = 60 / tempo;
        const chunkDuration = beatDuration * 0.5;
        return { chunkDuration };
    }, [tempo]);

    // ループモードがrhythm以外の場合にメロディループを開始
    // setTimeoutを使ってテンポに合わせたループを実装
    useEffect(() => {
        if (loopMode === 'rhythm') {
            return;
        }
        if (loopMode === 'both') {
            segmentsRef.current = currentSegments.melody;
        } else {
            segmentsRef.current = currentSegments.melody;
        }
        setIsLooping(true);
        isLoopingRef.current = true;

        const playableSegments = segmentsRef.current || [];
        let index = 0;
        const total = playableSegments.length;

        // 再帰的に自身を呼び出してループを継続
        const loop = () => {
            if (!isLoopingRef.current || total === 0) return;
            index = (index + 1) % total;
            setTimeout(loop, chunkDuration * 1000);
        };

        setTimeout(loop, chunkDuration * 1000);

        // クリーンアップ：ループ停止フラグをリセット
        return () => {
            setIsLooping(false);
            isLoopingRef.current = false;
        };
    }, [loopMode, currentSegments.melody, chunkDuration]);

    return null;
};
