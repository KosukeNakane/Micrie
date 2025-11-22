// [Story] features/ui - MelodyEditor.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import React, { useEffect } from 'react'

import { GlobalAudioProvider } from '@/entities/audio'
import { usePatternEditor } from '@/entities/pattern/model/usePatternEditor'
import { SegmentProvider, useSegment } from '@/entities/segment'

import { MelodyEditor } from './MelodyEditor'

import type { Meta, StoryObj } from '@storybook/react-vite'

// Storybook 用の初期状態セットアップ（Zustand ストアにダミーのメロディーセグメントを投入）
const SetupState: React.FC = () => {
  const { setLoopMode } = useSegment()
  const { setMelodySegments } = usePatternEditor()
  useEffect(() => {
    setLoopMode('melody')
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
    const segments = Array.from({ length: 32 }, (_, i) => ({
      label: notes[i % notes.length],
      note: notes[i % notes.length],
      start: i / 16,
      end: (i + 1) / 16,
    }))
    setMelodySegments(segments as any)
  }, [setLoopMode, setMelodySegments])
  return null
}

const meta: Meta<typeof MelodyEditor> = {
  title: 'Features/MelodyEditor',
  component: MelodyEditor,
  decorators: [
    (Story) => (
      <GlobalAudioProvider>
        <SegmentProvider>
          <SetupState />
          <div style={{ padding: 12 }}>
            <Story />
          </div>
        </SegmentProvider>
      </GlobalAudioProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
