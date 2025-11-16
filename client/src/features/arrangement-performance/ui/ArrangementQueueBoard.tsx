// [UI] features/ui - ArrangementQueueBoard.tsx
// 役割: パフォーマンス用のアレンジキューと再生コントロールを表示
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import type { ChangeEvent } from 'react';

import {
  useArrangementPlayerStore,
  selectArrangementQueue,
  ARRANGEMENT_PERFORMANCE_QUEUE_SIZE,
} from '@/entities/arrangement';
import { useArrangementPatternsStore } from '@/entities/arrangement/model/arrangementStore';

import { useArrangementPerformer } from '../model/useArrangementPerformer';

export const ArrangementQueueBoard = () => {
  const queue = useArrangementPlayerStore(selectArrangementQueue);
  const assignSlotToQueue = useArrangementPlayerStore((state) => state.assignSlotToQueue);
  const clearQueueSlot = useArrangementPlayerStore((state) => state.clearQueueSlot);
  const patterns = useArrangementPatternsStore((state) => state.patterns);

  const { queueInfo, playbackMode, status, stopQueue, skipCurrent } = useArrangementPerformer();

  const availablePatterns = useMemo(
    () => patterns.filter((pattern): pattern is NonNullable<typeof pattern> => !!pattern),
    [patterns],
  );

  return (
    <Box
      mt={8}
      px={8}
      display="flex"
      flexDirection="column"
      gap={4}
      alignItems="center"
    >
      <Flex
        width="100%"
        maxW="820px"
        justifyContent="center"
        gap={4}
        flexDirection="row"
      >
        {Array.from({ length: ARRANGEMENT_PERFORMANCE_QUEUE_SIZE }).map((_, visualIndex) => {
          const queueIndex = visualIndex;
          const info = queueInfo[queueIndex];
          const patternName = info?.name ?? 'EMPTY';
          const isActive = playbackMode === 'queue' && status === 'playing' && info?.isActive;
          const currentPatternId = queue[queueIndex]?.slotId ?? null;

          const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
            const value = event.target.value;
            if (!value) {
              assignSlotToQueue(queueIndex, null);
            } else {
              assignSlotToQueue(queueIndex, value);
            }
          };

          return (
            <Box
              key={queueIndex}
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
                SLOT {queueIndex + 1}
              </Text>
              <Text
                fontSize="15px"
                fontWeight="700"
                color="rgba(5,4,69,0.85)"
                mt={1}
                css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {patternName}
              </Text>
              <Flex justifyContent="center" gap={2} mt={4} alignItems="center">
                <select
                  value={currentPatternId ?? ''}
                  onChange={handleSelect}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(5,4,69,0.25)' }}
                >
                  <option value="">-- None --</option>
                  {availablePatterns.map((pattern) => (
                    <option key={pattern.id} value={pattern.id}>
                      {pattern.name}
                    </option>
                  ))}
                </select>
                <Button size="xs" variant="ghost" onClick={() => clearQueueSlot(queueIndex)}>
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
      <Flex gap={3} alignItems="center" justifyContent="center">
        <Button
          variant="outline"
          size="sm"
          onClick={stopQueue}
          disabled={status !== 'playing'}
        >
          Stop
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={skipCurrent}
          disabled={status !== 'playing'}
        >
          Skip
        </Button>
      </Flex>
    </Box>
  );
};
