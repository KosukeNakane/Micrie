// [UI] widgets/ui - SavedPatternPanel.tsx
// 役割: SavedPatternStore の6スロットを操作するサイドバー
import { Box, Button, Icon, Text } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { PiFloppyDiskDuotone } from 'react-icons/pi';

import { StyledArea } from '@/shared/ui';

import { useSavedPatterns } from '../model/useSavedPatterns';

const SidebarRoot = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	width: 100%;
	height: 100%;
`;

const SidebarTitle = styled(Text)`
	font-size: 18px;
	font-weight: 700;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: rgba(5, 4, 69, 0.75);
`;

const PatternList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
	flex: 1 1 auto;
	overflow-y: auto;
	padding-right: 4px;
`;

const PatternCard = styled(StyledArea)`
	width: 100%;
	margin: 0;
	padding: 14px 16px;
	flex-direction: column;
	align-items: stretch;
	gap: 12px;
	justify-content: flex-start;
	background: rgba(255, 255, 255, 0.32);
	border: 1px solid rgba(255, 255, 255, 0.42);
	box-shadow: none;
`;

const PatternHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
`;

const PatternName = styled.span`
	font-size: 15px;
	font-weight: 700;
`;

const PatternStatus = styled.span`
	font-size: 12px;
	color: rgba(5, 4, 69, 0.55);
`;

const ButtonGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 8px;
`;

export const SavedPatternPanel = () => {
	const { slots, canSave, saveToSlot, loadFromSlot, renameSlot, clearSlot } = useSavedPatterns();

	const handleRename = (index: number, currentName: string) => {
		const next = window.prompt('パターン名を入力', currentName);
		if (typeof next !== 'string') return;
		renameSlot(index, next);
	};

	return (
		<Box
			width="100%"
			height="100%"
			maxHeight="100%"
			padding="20px"
			display="flex"
			flexDirection="column"
			alignItems="stretch"
		>
			<SidebarRoot>
				<SidebarTitle>Saved Patterns</SidebarTitle>
				<PatternList>
					{slots.map((slot, i) => (
						<PatternCard key={i + 1}>
							<PatternHeader>
								<PatternName>{slot.name}</PatternName>
								<Icon
									as={PiFloppyDiskDuotone}
									boxSize={5}
									color={slot.hasData ? 'rgba(76, 106, 255, 0.75)' : 'rgba(5, 4, 69, 0.4)'}
								/>
							</PatternHeader>
							<PatternStatus>{slot.description}</PatternStatus>
							<ButtonGrid>
								<Button
									size="sm"
									variant="solid"
									colorScheme="blue"
									disabled={!canSave}
									onClick={() => saveToSlot(slot.index)}
								>
									保存
								</Button>
								<Button
									size="sm"
									variant="outline"
									colorScheme="blue"
									disabled={!slot.hasData}
									onClick={() => loadFromSlot(slot.index)}
								>
									読み込み
								</Button>
								<Button
									size="sm"
									variant="ghost"
									colorScheme="blue"
									disabled={!slot.hasData}
									onClick={() => handleRename(slot.index, slot.name)}
								>
									改名
								</Button>
								<Button
									size="sm"
									variant="ghost"
									colorScheme="red"
									disabled={!slot.hasData}
									onClick={() => clearSlot(slot.index)}
								>
									クリア
								</Button>
							</ButtonGrid>
						</PatternCard>
					))}
				</PatternList>
			</SidebarRoot>
		</Box>
	);
};
