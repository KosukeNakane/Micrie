// 録音長さ（バー数）を選択するセレクトボックスコンポーネント。
// グローバルなbarCount状態を使用して、選択値を変更する。

import { useBarCount } from "../../../context/BarCountContext";

export function RecordingLengthSelector() {

    // グローバルなbarCountの状態と更新関数をコンテキストから取得
    const { barCount, setBarCount } = useBarCount();
    // bar数（1, 2, 4）を選択するセレクトボックス
    return (
        <select value={barCount} onChange={(e) => setBarCount(Number(e.target.value))}>
            <option value={1}>1 bar</option>
            <option value={2}>2 bar</option>
            <option value={4}>4 bar</option>
        </select>
    );
}