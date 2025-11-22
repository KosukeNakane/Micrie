import { useEffect } from 'react';

import { usePlaybackController } from '@/features/playback';

export const useSpacebarPlayback = () => {
	const { loopPlay, stop, isLoopPlaying } = usePlaybackController();

	useEffect(() => {
		const handleSpace = (event: KeyboardEvent) => {
			if (event.code !== 'Space' && event.key !== ' ') return;

			const target = event.target as HTMLElement | null;
			if (target) {
				const tag = target.tagName;
				if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {
					return;
				}
			}

			event.preventDefault();
			if (isLoopPlaying) {
				stop();
			} else {
				void loopPlay();
			}
		};

		window.addEventListener('keydown', handleSpace);
		return () => window.removeEventListener('keydown', handleSpace);
	}, [isLoopPlaying, loopPlay, stop]);
};
