// MelodyセグメントとRhythmセグメントを統合し、解析結果を一覧表示するコンポーネント

import { useState } from 'react';

import { useSegment } from '@entities/segment/model/SegmentContext';
import { RectButton } from '@shared/ui/RectButton';

export const AnalysisResult = () => {
    // MelodyおよびRhythmのセグメント配列をコンテキストから取得
    const { melodySegments, rhythmSegments } = useSegment();
    // 2つのセグメント配列を結合して1つのリストにまとめる
    const segments = [...melodySegments, ...rhythmSegments];

    const [showResults, setShowResults] = useState(false);
    const toggleResults = () => setShowResults((prev) => !prev);

    return (
        <div style={{ marginTop: '10px' }}>
            <RectButton
                label={showResults ? 'Hide Analysis' : 'Show Analysis'}
                onClick={toggleResults}
            />
            {showResults && (
                <div style={{ marginTop: '20px' }}>
                    <h3>解析結果（Melody + Rhythm）:</h3>
                    {/* 各セグメントの属性を整形して表示（存在する属性のみ条件付きで表示） */}
                    {segments.map((seg, index) => (
                        <p key={index}>
                            ラベル: {seg.label} / 開始: {seg.start.toFixed(2)}s / 終了: {seg.end.toFixed(2)}s
                            {seg.hz !== undefined && ` / 周波数: ${Math.round(seg.hz)}Hz`}
                            {seg.note && ` / 音階: ${seg.note}`}
                            {seg.rms !== undefined && ` / 音量: ${seg.rms.toFixed(2)}`}
                            {seg.confidence !== undefined && ` / 信頼度: ${seg.confidence.toFixed(2)}`}
                            {seg.confidence_rms !== undefined && ` / conf*rms: ${seg.confidence_rms.toFixed(4)}`}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};