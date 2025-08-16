// 音声データをバックエンドに送信して、リズムまたはメロディーの解析を行う関数。
// 解析モード（whisper/keras）に応じて適切なエンドポイントへ送信する。
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const analyzeAudio = async (
  blob: Blob,
  tempo: number,
  barCount: number,
  mode: 'rhythm' | 'melody',
  Amode: 'whisper' | 'keras'
): Promise<any> => {
  // 解析に必要なパラメータをFormDataに格納
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('tempo', tempo.toString());
  formData.append('bar_count', barCount.toString());

  // モードに応じてエンドポイントを決定
  const endpoint =
    mode === 'melody'
      ? '/pitch'
      : Amode === 'whisper'
        ? '/analyze'
        : '/predict';

  // エンドポイントにPOSTリクエストを送信
  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  // エラーがあれば例外をスロー
  if (!res.ok) {
    throw new Error(`Analysis request failed with status ${res.status}`);
  }

  // 結果をJSONとして返す
  return await res.json();
};