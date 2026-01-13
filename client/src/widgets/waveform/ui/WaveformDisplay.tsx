// [UI] widgets/ui - WaveformDisplay.tsx
// 役割: 表示・入力のUIコンポーネント
// 波形表示・再生・ループ・セグメントラベル描画を担うメインUIコンポーネント
import styled from '@emotion/styled';
import { useRef } from 'react';

import { useRecording } from '@entities/audio';
import { StyledArea } from '@shared/ui';

import { SamplerPads, useSamplerRecorder } from '@/features/sampler';

import { ModeSelectArea } from './ModeSelectArea';
import { RecordingControlArea } from './RecordingControlArea';

export const CenteredArea = styled(StyledArea)`
	position: relative;
	flex-direction: column;
	justify-content: flex-start; /* 余白が広がらないように上寄せ */
	/* gap: 0; StyledAreaの既定gap(約6px)を無効化 */
	width: 600px;
	height: 720px;
	margin: 20px auto;
`;

const TrimToggle = styled.button<{ $active: boolean }>`
	align-self: flex-end;
	margin-right: 12px;
	padding: 6px 10px;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.35);
	background: ${({ $active }) =>
		$active
			? 'linear-gradient(135deg, rgba(126, 217, 193, 0.8), rgba(72, 255, 151, 0.8))'
			: 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(140,194,209,0.25))'};
	color: rgba(5, 4, 69, 0.82);
	cursor: pointer;
	font-size: 12px;
	font-weight: 700;
	transition: transform 0.1s ease, background 0.16s ease;
	box-shadow: 0 6px 14px rgba(5, 4, 69, 0.08);
	&:active {
		transform: translateY(1px);
	}
`;

type Props = { audioBlob: Blob | null; onToggleRecording?: () => void };

export const WaveformDisplay = ({ audioBlob: _audioBlob, onToggleRecording }: Props) => {
	const {
		pads,
		recordingPadIndex,
		trimEnabled,
		setTrimEnabled,
		lastPlayedBuffer,
		playbackProgress,
		lastPlayedPadIndex,
		lastPlayedPadSeq,
		handlePadPointerDown,
		handlePadPointerUp,
		handlePadPointerLeave,
		handlePadPointerCancel,
		handlePadClick,
		getPadHint,
		getPadMeta,
	} = useSamplerRecorder();
	const { isRecording: globalRecording } = useRecording();
	const isRecording = globalRecording;
	const centerRef = useRef<HTMLDivElement | null>(null);

	return (
		<CenteredArea ref={centerRef}>
			<RecordingControlArea
				isRecording={isRecording}
				onToggleRecording={onToggleRecording}
				lastPlayedBuffer={lastPlayedBuffer}
				playbackProgress={playbackProgress}
			/>
			<ModeSelectArea />
			<TrimToggle
				type="button"
				$active={trimEnabled}
				onClick={() => setTrimEnabled((prev) => !prev)}
				title="先頭の無音を自動トリム"
			>
				Trim Silence: {trimEnabled ? 'On' : 'Off'}
			</TrimToggle>
			<SamplerPads
				pads={pads}
				recordingPadIndex={recordingPadIndex}
				onPadPointerDown={handlePadPointerDown}
				onPadPointerUp={handlePadPointerUp}
				onPadPointerLeave={handlePadPointerLeave}
				onPadPointerCancel={handlePadPointerCancel}
				onPadClick={handlePadClick}
				lastPlayedPadIndex={lastPlayedPadIndex}
				lastPlayedPadSeq={lastPlayedPadSeq}
				getPadHint={getPadHint}
				getPadMeta={getPadMeta}
			/>
		</CenteredArea>
	);
};
