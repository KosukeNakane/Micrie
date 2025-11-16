// [UI] widgets/ui - ArrangementPatternsSidebar.tsx
// 役割: アレンジメントパターンへのアクセス用の縦型サイドバーを表示
import styled from '@emotion/styled';
import { Box, Button, Icon, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { PiMusicNotesPlusDuotone } from 'react-icons/pi';

import { useArrangementPatterns } from '@/features/arrangement-manage';
import { StyledArea } from '@/shared/ui';

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

const ButtonGroup = styled.div`
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 8px;
`;

const formatTimestamp = (value: number | null) => {
	if (!value) return '未保存のデータ';
	try {
		return `保存: ${new Date(value).toLocaleString('ja-JP', {
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		})}`;
	} catch {
		return '保存済み';
	}
};

export const ArrangementPatternsSidebar = () => {
	const { patterns, savePattern, loadPattern, clearPattern } = useArrangementPatterns();
	const statusList = useMemo(
		() =>
			patterns.map((pattern) => ({
				...pattern,
				statusText: formatTimestamp(pattern.savedAt),
			})),
		[patterns]
	);

	return (
		<Box
			position="fixed"
			top={0}
			bottom={0}
			right={-140}
			width="320px"
			maxWidth="85vw"
			zIndex={6}
			height="100%"
			padding="20px"
			display="flex"
			flexDirection="column"
			alignItems="stretch"
		>
			<SidebarRoot>
				<SidebarTitle>Arrangements</SidebarTitle>
				<PatternList>
					{statusList.map((pattern) => (
						<PatternCard key={pattern.index}>
							<PatternHeader>
								<PatternName>{pattern.name}</PatternName>
								<Icon
									as={PiMusicNotesPlusDuotone}
									boxSize={5}
									color={pattern.hasData ? 'rgba(76, 106, 255, 0.75)' : 'rgba(5, 4, 69, 0.4)'}
								/>
							</PatternHeader>
							<PatternStatus>{pattern.statusText}</PatternStatus>
							<ButtonGroup>
								<Button
									size="sm"
									variant="solid"
									colorScheme="blue"
									onClick={() => savePattern(pattern.index)}
								>
									保存
								</Button>
								<Button
									size="sm"
									variant="outline"
									colorScheme="blue"
									disabled={!pattern.hasData}
									onClick={() => loadPattern(pattern.index)}
								>
									読み込み
								</Button>
								<Button
									size="sm"
									variant="ghost"
									colorScheme="blue"
									disabled={!pattern.hasData}
									onClick={() => clearPattern(pattern.index)}
								>
									クリア
								</Button>
							</ButtonGroup>
						</PatternCard>
					))}
				</PatternList>
			</SidebarRoot>
		</Box>
	);
};
