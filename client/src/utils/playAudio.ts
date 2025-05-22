export const playAudio = async (
    buffer: AudioBuffer,
    startTime = 0,
    endTime?: number
  ) => {
    const audioCtx = new AudioContext();
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
  
    // duration 指定があれば計算
    const duration = endTime ? endTime - startTime : undefined;
    source.start(0, startTime, duration); // ← 開始時刻・再生位置・再生時間を指定
  };