// [UI] features/ui - AudioUnlockGate.tsx
// 役割: 表示・入力のUIコンポーネント
import { useEffect, useState } from 'react';

import { GlobalAudioEngine } from '@/entities/audio';

export default function AudioUnlockGate() {
    const [unlocked, setUnlocked] = useState(false);

    useEffect(() => {
        const ctx = GlobalAudioEngine.instance.audioContext;
        if (ctx && ctx.state === 'running') setUnlocked(true);
    }, []);

    useEffect(() => {
        if (unlocked) return;

        const handler = async () => {
            try {
                await GlobalAudioEngine.instance.unlock(); // ← ここ大事
                const ctx = GlobalAudioEngine.instance.audioContext;
                if (ctx?.state === 'running') setUnlocked(true);
            } catch (e) {
                console.warn('Audio unlock failed:', e);
            }
        };

        // 一度だけ解錠したいので、幅広いジェスチャーをフック
        window.addEventListener('pointerdown', handler, { once: true });
        window.addEventListener('keydown', handler, { once: true });
        window.addEventListener('touchend', handler, { once: true });

        return () => {
            window.removeEventListener('pointerdown', handler);
            window.removeEventListener('keydown', handler);
            window.removeEventListener('touchend', handler);
        };
    }, [unlocked]);

    if (unlocked) return null;

    // カジュアルに被せるオーバーレイ（必要ならデザイン調整）
    return (
        <div style={{
            position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
            background: 'rgba(0,0,0,0.5)', color: '#fff', zIndex: 9999
        }}>
            <button
                onClick={async () => {
                    await GlobalAudioEngine.instance.unlock();
                    setUnlocked(true);
                }}
                style={{ fontSize: 16, padding: '10px 16px', cursor: 'pointer' }}
            >
                Tap / Click to enable audio
            </button>
        </div>
    );
}
