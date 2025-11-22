// [UI] features/ui - ArrangementPlaybackToggle.tsx
// 役割: 再生対象（編集中/キュー）の切り替えトグル
import { Button } from '@chakra-ui/react';
import styled from '@emotion/styled';

import { usePlaybackController } from '@/features/playback';

import { useArrangementPlaybackMode } from '../model/useArrangementPlaybackMode';

const GlassButton = styled(Button)<{ $active: boolean }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 10px 14px;
	margin: 0;
	min-width: 110px;
	font-family: 'brandon-grotesque', sans-serif;
	font-weight: 500;
	font-style: normal;
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.18);
	background: ${({ $active }) =>
		$active
			? 'linear-gradient(135deg, rgb(126, 217, 193), rgb(72, 255, 151))'
			: 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(140,194,209,0.25))'};
	color: rgba(5, 4, 69, 0.8);
	transform: ${({ $active }) => ($active ? 'scale(0.97)' : 'scale(1)')};
	box-shadow: ${({ $active }) =>
		$active ? 'inset 0 2px 6px rgba(0, 0, 0, 0.12)' : 'none'};
	transition: transform 0.1s ease, background 0.16s ease, box-shadow 0.16s ease;

	&:active {
		transform: ${({ $active }) => ($active ? 'scale(0.94)' : 'scale(0.96)')};
		box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.18);
	}
`;

export const ArrangementPlaybackToggle = () => {
	const { mode, setMode } = useArrangementPlaybackMode();
	const { reset } = usePlaybackController();

	const handleSelect = (next: 'off' | 'arrangement') => {
		if (next === mode) return;
		if (next === 'arrangement') {
			reset();
		}
		setMode(next);
	};

	return (
		<div style={{ display: 'flex', gap: '12px' }}>
			<GlassButton
				size="sm"
				$active={mode === 'off'}
				aria-pressed={mode === 'off'}
				variant={mode === 'off' ? 'solid' : 'outline'}
				colorScheme="blue"
				onClick={() => handleSelect('off')}
				title="編集中のアレンジを再生"
			>
				Editor
			</GlassButton>
			<GlassButton
				size="sm"
				$active={mode === 'arrangement'}
				aria-pressed={mode === 'arrangement'}
				variant={mode === 'arrangement' ? 'solid' : 'outline'}
				colorScheme="purple"
				onClick={() => handleSelect('arrangement')}
				title="アレンジメントスロットを順番に再生"
			>
				Arrangement
			</GlassButton>
		</div>
	);
};
