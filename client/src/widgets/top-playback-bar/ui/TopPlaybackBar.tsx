import { RectButton } from '@shared/ui/RectButton';
import { usePlaybackController } from '@features/playback/model/usePlaybackController';

export const TopPlaybackBar = () => {
  const { loopPlay, stop, isLoopPlaying } = usePlaybackController();
  const onToggle = async () => {
    if (isLoopPlaying) stop();
    else await loopPlay();
  };
  return (

    <RectButton onClick={onToggle} label={isLoopPlaying ? '■ Stop Music' : '▶︎ Play Music'} />

  );
};

