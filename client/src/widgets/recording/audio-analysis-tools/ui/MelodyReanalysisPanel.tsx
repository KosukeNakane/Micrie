// [UI] widgets/ui - MelodyReanalysisPanel.tsx
// 役割: 表示・入力のUIコンポーネント
import { RectButton } from "@shared/ui/RectButton";
import React, { useState } from "react";

import { useBarCount } from "@/entities/bar-count/model/BarCountContext";
import { useSegment } from "@/entities/segment/model/SegmentContext";
import { useTempo } from "@/entities/tempo/model/TempoContext";
import { apiFetch } from "@/shared/api/apiClient";
import { toaster } from "@/shared/ui/toaster";

type Props = { audioBlob: Blob | null };

export const MelodyReanalysisPanel: React.FC<Props> = ({ audioBlob }) => {
  const { tempo } = useTempo();
  const { barCount } = useBarCount();
  const { setMelodySegments, setLoopMode } = useSegment();
  const [loading, setLoading] = useState(false);

  const handleReanalyze = async () => {
    if (!audioBlob) {
      toaster.warning({ title: '音声ファイルが読み込まれていません。' });
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', audioBlob);
      formData.append('tempo', String(tempo));
      formData.append('bar_count', String(barCount));
      const data: any = await apiFetch('pitch', { method: 'POST', body: formData });
      if (!data || !Array.isArray(data.pitch_series)) {
        toaster.error({ title: '解析結果が不正です' });
        return;
      }
      const totalDuration = (60 / tempo) * 4 * barCount;
      const count = Math.max(1, data.pitch_series.length);
      const chunkDuration = totalDuration / count;
      const segments = data.pitch_series.map((seg: any, index: number) => {
        const start = chunkDuration * index;
        const end = chunkDuration * (index + 1);
        const labelRaw = seg.label ?? seg.note ?? 'rest';
        const note = labelRaw === 'rest' ? 'rest' : String(labelRaw);
        const label = note;
        return {
          label,
          note,
          hz: typeof seg.hz === 'number' && Number.isFinite(seg.hz) ? seg.hz : 0,
          start,
          end,
          confidence: typeof seg.confidence === 'number' && Number.isFinite(seg.confidence) ? seg.confidence : 0,
          rms: typeof seg.rms === 'number' && Number.isFinite(seg.rms) ? seg.rms : 0,
          confidence_rms: typeof seg.confidence_rms === 'number' && Number.isFinite(seg.confidence_rms) ? seg.confidence_rms : 0,
        };
      });
      setMelodySegments(segments);
      try { setLoopMode('melody'); } catch { }
      toaster.success({ title: '再解析が完了しました' });
    } catch (e) {
      console.error(e);
      toaster.error({ title: '解析に失敗しました' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <RectButton
        onClick={() => { if (!loading) handleReanalyze(); }}
        label={loading ? "Analyzing…" : "Run Analysis"}
        widthPx={270}
      />
    </div>
  );
};
