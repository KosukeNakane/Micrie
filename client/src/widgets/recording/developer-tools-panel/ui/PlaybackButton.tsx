import { RectButton } from "@shared/ui/RectButton";
import { usePlaybackController } from "@features/playback/model/usePlaybackController";

interface PlaybackButtonProps {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PlaybackButton = ({ isPlaying, setIsPlaying }: PlaybackButtonProps) => {
  const { loopPlay, stop } = usePlaybackController();

  const handleClick = async () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      // ループ再生
      await loopPlay();
      setIsPlaying(true);
    }
  };

  return <RectButton label={isPlaying ? "停止" : "再生"} onClick={handleClick} />;
};
