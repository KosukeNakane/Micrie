// [UI] widgets/ui - WaveformDisplay.tsx
// 役割: 表示・入力のUIコンポーネント
// 波形表示・再生・ループ・セグメントラベル描画を担うメインUIコンポーネント
import styled from '@emotion/styled';
import { StyledArea } from '@shared/ui';
import { useRecording } from '@entities/audio';
import { ModeSelectArea } from './ModeSelectArea';
import { RecordingControlArea } from './RecordingControlArea';
import { SamplerPads, useSamplerRecorder } from '@/features/sampler';

export const CenteredArea = styled(StyledArea)`
	position: relative;
	flex-direction: column;
	justify-content: flex-start; /* 余白が広がらないように上寄せ */
	/* gap: 0; StyledAreaの既定gap(約6px)を無効化 */
	width: 600px;
	height: 720px;
	margin: 20px auto;
`;

type Props = { audioBlob: Blob | null; onToggleRecording?: () => void };

export const WaveformDisplay = ({ audioBlob: _audioBlob, onToggleRecording }: Props) => {
	const {
		pads,
		recordingPadIndex,
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

	return (
		<CenteredArea>
			<RecordingControlArea isRecording={isRecording} onToggleRecording={onToggleRecording} />
			<ModeSelectArea />
			<SamplerPads
				pads={pads}
				recordingPadIndex={recordingPadIndex}
				onPadPointerDown={handlePadPointerDown}
				onPadPointerUp={handlePadPointerUp}
				onPadPointerLeave={handlePadPointerLeave}
				onPadPointerCancel={handlePadPointerCancel}
				onPadClick={handlePadClick}
				getPadHint={getPadHint}
				getPadMeta={getPadMeta}
			/>
		</CenteredArea>
	);
};
