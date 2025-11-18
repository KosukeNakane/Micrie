// [UI] features/ui - ArrangementPanel.tsx
// 役割: アレンジメントスロットの設定と制御を提供
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useMemo, type ChangeEvent } from 'react';

import { useArrangementStore, ARRANGEMENT_SLOT_COUNT } from '@/entities/pattern/model/arrangementStore';
import { useSavedPatternStore } from '@/entities/pattern/model/savedPatternStore';
import { useProjectState } from '@/features/project-save-load';

import { useArrangementPerformer } from '../model/useArrangementPerformer';
import { ArrangementPlaybackToggle } from './ArrangementPlaybackToggle';

export const ArrangementPanel = () => {
  const slots = useArrangementStore((state) => state.slots);
  const setSlot = useArrangementStore((state) => state.setSlot);
  const clearSlot = useArrangementStore((state) => state.clearSlot);
  const swapSlots = useArrangementStore((state) => state.swapSlots);

  const savedPatterns = useSavedPatternStore((state) => state.patterns);
  const availablePatterns = useMemo(
    () => savedPatterns.filter((pattern): pattern is NonNullable<typeof pattern> => !!pattern),
    [savedPatterns],
  );

  const { arrangementInfo } = useArrangementPerformer();

  return (
    <Box
      mt={8}
      px={8}
      display="flex"
      flexDirection="column"
      gap={4}
      alignItems="center"
    >
      <ArrangementPlaybackToggle />
      <Flex
        width="100%"
        maxW="820px"
        justifyContent="center"
        gap={4}
        flexDirection="row"
      >
        {Array.from({ length: ARRANGEMENT_SLOT_COUNT }).map((_, visualIndex) => {
          const info = arrangementInfo[visualIndex];
          const isActive = info?.isActive;
          const currentPatternId = slots[visualIndex]?.patternId ?? null;

          const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
            const value = event.target.value;
            setSlot(visualIndex, value || null);
            markProjectDirty();
          };

          const moveSlot = (delta: number) => {
            const target = visualIndex + delta;
            if (target < 0 || target >= ARRANGEMENT_SLOT_COUNT) return;
            swapSlots(visualIndex, target);
            markProjectDirty();
          };

          return (
            <Box
              key={visualIndex}
              flex="1 1 0"
              minW="150px"
              maxW="200px"
              border="1px solid rgba(76, 106, 255, 0.4)"
              borderRadius="12px"
              padding="16px"
              textAlign="center"
              background={isActive ? 'rgba(76, 106, 255, 0.18)' : 'rgba(255, 255, 255, 0.24)'}
              boxShadow={isActive ? '0 0 12px rgba(76, 106, 255, 0.45)' : 'inset 0 0 0 1px rgba(255,255,255,0.2)'}
              position="relative"
            >
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
                <select
                  value={currentPatternId ?? ''}
                  onChange={handleSelect}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(5,4,69,0.25)', width: '100%' }}
                >
                  <option value="">-- None --</option>
                  {availablePatterns.map((pattern, idx) => (
                    <option key={`${pattern.id}-${idx}`} value={pattern.id}>
                      {pattern.name}
                    </option>
                  ))}
                </select>
              </Flex>
              <Flex justifyContent="center" gap={2} mt={3}>
                <Button size="xs" variant="ghost" disabled={visualIndex === 0} onClick={() => moveSlot(-1)}>
                  ↑
                </Button>
                <Button size="xs" variant="ghost" disabled={visualIndex === ARRANGEMENT_SLOT_COUNT - 1} onClick={() => moveSlot(1)}>
                  ↓
                </Button>
                <Button size="xs" variant="ghost" onClick={() => { clearSlot(visualIndex); markProjectDirty(); }}>
                  Reset
                </Button>
              </Flex>
              <Text fontSize="11px" color="rgba(5,4,69,0.45)" mt={3}>
                再生順: 左→右
              </Text>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};
  const markProjectDirty = () => {
    try { useProjectState.getState().setLastSavedHash(null); } catch {}
  };
