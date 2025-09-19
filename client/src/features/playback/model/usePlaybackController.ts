// [Model] features/model - usePlaybackController.ts
// 役割: 再生操作のファサード（Transportの開始/停止/リセット）
import { useEffect } from 'react';
import * as Tone from 'tone';

import { GlobalAudioEngine } from '@entities/audio/lib/GlobalAudioEngine';
import { useTempo } from '@entities/tempo/model/TempoContext';
import { useTransportStore } from '@entities/transport/model/useTransportStore';

export const usePlaybackController = () => {
  const isLoopPlaying = useTransportStore((s) => s.isLoopPlaying);
  const setLoopPlaying = useTransportStore((s) => s.setLoopPlaying);

  const { tempo } = useTempo();
  // Parts構築や量子化は PlaybackBinder 側へ集約済み

  const loopPlay = async () => {
    if (isLoopPlaying) return;
    if (Tone.getContext().state !== 'running') await Tone.start();
    Tone.getTransport().bpm.value = tempo;
    await GlobalAudioEngine.instance.ensureStarted();
    await GlobalAudioEngine.instance.setMasterMuted(false);
    // ループ設定（Transport に任せる）
    Tone.getTransport().loop = true;
    Tone.getTransport().loopEnd = '2m';
    Tone.getTransport().start();
    setLoopPlaying(true);
  };

  const stop = () => {
    // 一時停止（位置保持）
    GlobalAudioEngine.instance.setMasterMuted(true);
    Tone.getTransport().pause();
    setLoopPlaying(false);
  };

  const reset = () => {
    // 停止（位置リセット0:0:0）
    GlobalAudioEngine.instance.setMasterMuted(true);
    Tone.getTransport().stop();
    setLoopPlaying(false);
  };

  useEffect(() => {
    const actuallyPlaying = Tone.getTransport().state === 'started';
    setLoopPlaying(actuallyPlaying);
  }, [setLoopPlaying]);

  return { loopPlay, stop, reset, isLoopPlaying };
};
