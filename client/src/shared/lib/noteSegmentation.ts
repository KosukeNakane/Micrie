// 連続するメロディーの音符を1つにまとめ、タイミングと長さを定量化（quantize）するユーティリティ。
// 'rest' を区切りとし、スケールに応じた音名補正も行う。

export type QuantizedNote = {
    note: string;           // 音名（例: 'C4'）
    startIndex: number;     // 16分音符単位の開始インデックス
    length: number;         // 連続する長さ（16分音符の数）
};

/**
 * melodySegments から QuantizedNote[] を抽出する
 * @param melodySegments string[] - メロディーの配列（16分音符単位）
 * @param scaleMode 'major' | 'minor' | 'chromatic' - スケールモード
 * @param pitchMaps { major: { [note: string]: string }, minor: { [note: string]: string } } - ピッチ補正マップ
 * @returns QuantizedNote[] - 連続する音を1つの音符としてまとめたリスト
 */

export function extractQuantizedNotes(
    melodySegments: string[],
    scaleMode: 'major' | 'minor' | 'chromatic',
    pitchMaps: { major: { [note: string]: string }, minor: { [note: string]: string } }
): QuantizedNote[] {
    // 出力となる定量化された音符の配列
    const result: QuantizedNote[] = [];
    let currentNote: string | null = null;
    let startIndex: number | null = null;

    // melodySegments を順に走査して音符のまとまりを検出
    for (let i = 0; i < melodySegments.length; i++) {
        const note = melodySegments[i];

        // スケールに応じて音名を補正
        const correctedNote =
            scaleMode === 'chromatic'
                ? note
                : pitchMaps[scaleMode][note.replace(/\d/, '')] + (note.match(/\d/)?.[0] || '4');

        // 音が休符でない場合、現在の音符と比較して処理
        if (note !== 'rest') {
            if (currentNote === null) {
                currentNote = correctedNote;
                startIndex = i;
            } else if (correctedNote !== currentNote) {
                // 異なる音が来たら確定
                result.push({
                    note: currentNote,
                    startIndex: startIndex!,
                    length: i - startIndex!,
                });
                currentNote = correctedNote;
                startIndex = i;
            }
        } else {
            // 'rest' の場合は現在の音符をクローズして result に追加
            if (currentNote !== null) {
                result.push({
                    note: currentNote,
                    startIndex: startIndex!,
                    length: i - startIndex!,
                });
                currentNote = null;
                startIndex = null;
            }
        }
    }

    // ループ終了後、最後に残った音符があれば追加
    if (currentNote !== null && startIndex !== null) {
        result.push({
            note: currentNote,
            startIndex,
            length: melodySegments.length - startIndex,
        });
    }

    return result;
}