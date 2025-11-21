// [UI] pages/ui - PerformancePage.tsx
// 役割: 表示・入力のUIコンポーネント
/** @jsxImportSource @emotion/react */

import { useEffect } from 'react';

import { useGlobalAudio } from '@entities/audio/model/GlobalAudioContext';
import { useEffects, type EffectKey } from '@entities/effects/model/EffectsContext';
import EffectsButton from '@features/effects/ui/EffectsButton';
import EffectsPanel from '@features/effects/ui/EffectsPanel';
import SplitHoldResetButton from '@features/effects/ui/SplitHoldResetButton';
import { VerticalFader } from '@features/effects/ui/VerticalFader';
import { TopPlaybackBar } from '@widgets/top-playback-bar';
import { VolumeControlPanel } from '@features/volume';
import { ArrangementPanel } from '@features/arrangement-performance';

import { useChannelsStore } from '@/entities/audio';
import { useEffectsUiStore } from '@/features/effects';

const LABELS: EffectKey[] = ['CRUSH', 'COMB', 'HICUT', 'LOWCUT', 'REVERB', 'DIRTY'];

type FadersProps = { springBack: boolean };
const Faders = ({ springBack }: FadersProps) => {
	const { effects, setEffect } = useEffects();
	const holdAll = useEffectsUiStore((s) => s.hold);
	const holdBy = useEffectsUiStore((s) => s.holdByKey);
	const toggleHoldFor = useEffectsUiStore((s) => s.toggleHoldFor);

	return (
		<div css={{ display: 'flex', gap: '12px', alignItems: 'flex-end', justifyContent: 'center' }}>
			{LABELS.map((label) => {
				const isHeld = !!holdAll || !!holdBy[label];
				const faderSpringBack = springBack && !isHeld; // 全体指定に対し、HOLD（全体/個別）が有効ならスプリングバック無効
				return (
					<div
						key={label}
						css={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
					>
						<VerticalFader
							label={label}
							value={effects[label]}
							onChange={(v) => setEffect(label, v)}
							springBack={faderSpringBack}
							width={60}
							height={180}
						/>
						<SplitHoldResetButton
							width={60}
							height={64}
							holdActive={isHeld}
							onToggleHold={() => toggleHoldFor(label)}
							onReset={() => setEffect(label, 0)}
						/>
					</div>
				);
			})}
		</div>
	);
};

export const PerformancePage = () => {
	const engine = useGlobalAudio();
	const hold = useEffectsUiStore((s) => s.hold);
	const toggleHold = useEffectsUiStore((s) => s.toggleHold);
	const { setEffect, setMany } = useEffects();
	const melodyMuted = useChannelsStore((s) => s.melodyMuted);
	const drumMuted = useChannelsStore((s) => s.drumMuted);
	const chordMuted = useChannelsStore((s) => s.chordMuted);
	const resetAll = () => {
		LABELS.forEach((label) => setEffect(label, 0));
	};

	const randomAll = () => {
		const patch: Partial<Record<EffectKey, number>> = {};
		LABELS.forEach((label) => {
			patch[label] = Math.random();
		});
		setMany(patch);
	};

	useEffect(() => {
		(async () => {
			await engine.ensureStarted();
			// ここでは停止や切断はしない。画面遷移しても継続再生させるため。
			// ストアのミュート状態をエンジンへ同期
			await engine.setChannelMuted('melody', melodyMuted);
			await engine.setChannelMuted('drum', drumMuted);
			await engine.setChannelMuted('chord', chordMuted);
		})();
	}, [engine]);

	// ミュート状態が変わったらエンジンに反映
	useEffect(() => {
		engine.setChannelMuted('melody', melodyMuted);
	}, [engine, melodyMuted]);
	useEffect(() => {
		engine.setChannelMuted('drum', drumMuted);
	}, [engine, drumMuted]);
	useEffect(() => {
		engine.setChannelMuted('chord', chordMuted);
	}, [engine, chordMuted]);

	return (
		<div>
			{/* 再生バー */}
			<TopPlaybackBar />
			<div
				css={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'flex-start',
					justifyContent: 'center',
					padding: '0 32px 32px',
				}}
			>
				<div css={{ marginRight: 32 }}>
					<EffectsPanel>
						<div
							css={{
								display: 'flex',
								justifyContent: 'center',
								gap: 12,
							}}
						>
							<Faders springBack={!hold} />
							<div
								css={{
									display: 'flex',
									flexDirection: 'column',
									gap: 12,
									alignItems: 'center',
									width: 60,
								}}
							>
								<EffectsButton label="RAND ALL" size={95} width={80} onClick={randomAll} />
								<EffectsButton
									label="HOLD ALL"
									size={95}
									width={80}
									active={hold}
									onClick={toggleHold}
								/>
								<EffectsButton label="RESET ALL" size={95} width={80} onClick={resetAll} />
							</div>
						</div>
					</EffectsPanel>
				</div>
				<div>
					<VolumeControlPanel />
				</div>
			</div>
			<ArrangementPanel />
		</div>
	);
};
