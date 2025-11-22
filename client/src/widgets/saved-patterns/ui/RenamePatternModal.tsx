import { Box, Button, Input, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { StyledArea } from '@/shared/ui';

type RenamePatternModalProps = {
	isOpen: boolean;
	initialName: string;
	onClose: () => void;
	onSubmit: (name: string) => void;
};

export const RenamePatternModal = ({
	isOpen,
	initialName,
	onClose,
	onSubmit,
}: RenamePatternModalProps) => {
	const [name, setName] = useState(initialName);
	const canSubmit = Boolean(name.trim());

	useEffect(() => {
		setName(initialName);
	}, [initialName, isOpen]);

	const handleSubmit = () => {
		const trimmed = name.trim();
		if (!trimmed) return;
		onSubmit(trimmed);
		onClose();
	};

	if (!isOpen) return null;

	return createPortal(
		<Box position="fixed" inset={0} zIndex={1000}>
			<Box position="absolute" inset={0} bg="blackAlpha.600" onClick={onClose} />
			<StyledArea
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					transform: 'translate(-50%, -50%)',
					width: 'min(92vw, 420px)',
					padding: '20px',
					margin: 0,
					display: 'block',
				}}
			>
				<Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
					<Text fontSize="lg" fontWeight="bold" m="1" color="rgba(255, 255, 255, 0.8)">
						Rename Pattern
					</Text>
				</Box>
				<Input
					autoFocus
					value={name}
					onChange={(e) => setName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') handleSubmit();
					}}
					bg="rgba(255, 255, 255, 0.1)"
					borderColor="rgba(255, 255, 255, 0.3)"
					color="white"
					placeholder="Pattern name"
					_placeholder={{ color: 'rgba(255, 255, 255, 0.379)' }}
				/>
				<Box display="flex" justifyContent="flex-end" gap={2} mt={3} mb={-1}>
					<Button
						variant="ghost"
						onClick={onClose}
						color="white"
						_hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
						borderColor="rgba(255, 255, 255, 0.3)"
					>
						Cancel
					</Button>
					<Button
						bg="transparent"
						color="white"
						_hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
						borderColor="rgba(255, 255, 255, 0.3)"
						disabled={!canSubmit}
						onClick={handleSubmit}
					>
						Save
					</Button>
				</Box>
			</StyledArea>
		</Box>,
		document.body
	);
};
