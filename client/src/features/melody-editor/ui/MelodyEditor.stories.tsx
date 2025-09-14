import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useEffect } from 'react'
import { MelodyEditor } from './MelodyEditor'
import { GlobalAudioProvider } from '@/entities/audio/model/GlobalAudioContext'
import { SegmentProvider, useSegment } from '@/entities/segment/model/SegmentContext'

// Storybook 用の初期状態セットアップ（Zustand ストアにダミーのメロディーセグメントを投入）
const SetupState: React.FC = () => {
  const { setLoopMode, setMelodySegments } = useSegment()
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
