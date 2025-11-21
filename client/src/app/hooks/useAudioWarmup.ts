import { useEffect } from 'react';

import { GlobalAudioEngine } from '@/entities/audio';

export const useAudioWarmup = () => {
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const engine = GlobalAudioEngine.instance;
		const warmup = async (_event?: Event) => {
			try {
				await engine.unlock();
			} catch (error) {
				if (import.meta.env.DEV) console.warn('Audio warmup failed', error);
			}
		};

		warmup();

		const options: AddEventListenerOptions = { once: true };
		window.addEventListener('pointerdown', warmup, options);
		window.addEventListener('keydown', warmup, options);
		window.addEventListener('touchend', warmup, options);

		return () => {
			window.removeEventListener('pointerdown', warmup);
			window.removeEventListener('keydown', warmup);
			window.removeEventListener('touchend', warmup);
		};
	}, []);
};
