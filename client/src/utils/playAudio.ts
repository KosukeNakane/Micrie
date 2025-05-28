// 指定した AudioBuffer の一部または全体を再生するユーティリティ関数
// startTime や endTime を指定することで部分再生も可能
export const playAudio = async (
    buffer: AudioBuffer,
    startTime = 0,
    endTime?: number
  ) => {
    const audioCtx = new AudioContext();
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    const duration = endTime ? endTime - startTime : undefined;
    source.start(0, startTime, duration); 
  };