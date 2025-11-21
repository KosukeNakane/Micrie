// [UI] features/ui - ArrangementPanel.tsx
// 役割: アレンジメントスロットの設定と制御を提供
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useMemo } from 'react';

import {
	useArrangementStore,
	ARRANGEMENT_SLOT_COUNT,
} from '@/entities/pattern/model/arrangementStore';
import { useSavedPatternStore } from '@/entities/pattern/model/savedPatternStore';
import { useProjectState } from '@/features/project-save-load';
import { StyledArea, GlassSelect } from '@/shared/ui';

import { useArrangementPerformer } from '../model/useArrangementPerformer';
import { ArrangementPlaybackToggle } from './ArrangementPlaybackToggle';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

const slotGlow = keyframes`
  0% { opacity: 0.25; transform: scale(0.96); }
  50% { opacity: 0.75; transform: scale(1); }
  100% { opacity: 0.25; transform: scale(0.96); }
`;

const SlotCard = styled(StyledArea)<{ $active: boolean }>`
	flex: 1 1 0;
	min-width: 150px;
	max-width: 200px;
	padding: 16px;
	margin: 0;
	border-radius: 12px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	text-align: center;
	gap: 4px;
	background: ${({ $active }) =>
		$active
			? 'linear-gradient(135deg, rgba(81, 113, 255, 0.4), rgba(44, 86, 196, 0.35))'
			: 'rgba(255, 255, 255, 0.24)'};
	border: 1px solid
		${({ $active }) => ($active ? 'rgba(76, 106, 255, 0.85)' : 'rgba(76, 106, 255, 0.4)')};
	box-shadow: ${({ $active }) =>
		$active
			? '0 0 18px rgba(76, 106, 255, 0.45), inset 0 0 0 1px rgba(255,255,255,0.35)'
			: 'inset 0 0 0 1px rgba(255,255,255,0.2)'};
	transition: background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
	position: relative;
	overflow: visible;
	color: rgba(5, 4, 69, 0.8);

	&::after {
		content: '';
		position: absolute;
		inset: -10px;
		border-radius: inherit;
		background: radial-gradient(circle, rgba(76, 106, 255, 0.32) 0%, rgba(76, 106, 255, 0) 70%);
		filter: blur(6px);
		animation: ${({ $active }) => ($active ? `${slotGlow} 1.6s ease-in-out infinite` : 'none')};
		opacity: ${({ $active }) => ($active ? 1 : 0)};
		pointer-events: none;
		z-index: -1;
		transition: opacity 0.25s ease;
	}
`;

export const ArrangementPanel = () => {
	const slots = useArrangementStore((state) => state.slots);
	const setSlot = useArrangementStore((state) => state.setSlot);
	const clearSlot = useArrangementStore((state) => state.clearSlot);
	const swapSlots = useArrangementStore((state) => state.swapSlots);

	const savedPatterns = useSavedPatternStore((state) => state.patterns);
	const availablePatterns = useMemo(
		() =>
			savedPatterns
				.map((slot) => (slot.pattern ? { id: slot.pattern.id, name: slot.name } : null))
				.filter((entry): entry is { id: string; name: string } => Boolean(entry)),
		[savedPatterns]
	);
	const patternOptions = useMemo(
		() => [
			{ value: '', label: '-- None --' },
			...availablePatterns.map((p) => ({ value: p.id, label: p.name })),
		],
		[availablePatterns]
	);

	const { arrangementInfo } = useArrangementPerformer();

	return (
		<Box mt={8} px={8} display="flex" flexDirection="column" gap={4} alignItems="center">
			<ArrangementPlaybackToggle />
			<Flex width="100%" maxW="820px" justifyContent="center" gap={4} flexDirection="row">
				{Array.from({ length: ARRANGEMENT_SLOT_COUNT }).map((_, visualIndex) => {
					const info = arrangementInfo[visualIndex];
					const isActive = info?.isActive;
					const currentPatternId = slots[visualIndex]?.patternId ?? null;

					const moveSlot = (delta: number) => {
						const target = visualIndex + delta;
						if (target < 0 || target >= ARRANGEMENT_SLOT_COUNT) return;
						swapSlots(visualIndex, target);
						markProjectDirty();
					};
					const selectedOption =
						patternOptions.find((opt) => opt.value === (currentPatternId ?? '')) ??
						patternOptions[0];

					return (
						<SlotCard key={visualIndex} $active={Boolean(isActive)}>
							<Text fontSize="13px" fontWeight="600" color="rgba(5,4,69,0.65)">
								SLOT {visualIndex + 1}
							</Text>
							<Text
								fontSize="15px"
								fontWeight="700"
								color="rgba(5,4,69,0.85)"
								mt={1}
								css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
							>
								{info?.name ?? 'EMPTY'}
							</Text>
							<Flex justifyContent="center" gap={2} mt={4} alignItems="center">
								<GlassSelect
									options={patternOptions}
									value={selectedOption}
									widthPx={180}
									onChange={(opt) => {
										setSlot(visualIndex, opt.value || null);
										markProjectDirty();
									}}
								/>
							</Flex>
							<Flex justifyContent="center" gap={2} mt={3}>
								<Button
									size="xs"
									variant="ghost"
									disabled={visualIndex === 0}
									onClick={() => moveSlot(-1)}
								>
									<span>
										<KeyboardArrowLeftIcon />
									</span>
								</Button>
								<Button
									size="xs"
									variant="ghost"
									disabled={visualIndex === ARRANGEMENT_SLOT_COUNT - 1}
									onClick={() => moveSlot(1)}
								>
									<span>
										<KeyboardArrowRightIcon />
									</span>
								</Button>
								<Button
									size="xs"
									variant="ghost"
									onClick={() => {
										clearSlot(visualIndex);
										markProjectDirty();
									}}
								>
									Reset
								</Button>
							</Flex>
						</SlotCard>
					);
				})}
			</Flex>
		</Box>
	);
};
const markProjectDirty = () => {
	try {
		useProjectState.getState().setLastSavedHash(null);
	} catch {}
};
