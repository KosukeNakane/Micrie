// [Story] features/ui - VolumeControl.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { GlobalAudioProvider } from '@entities/audio'
import { VolumeProvider } from '@entities/volume'

import { VolumeControl } from '@/features/volume'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof VolumeControl> = {
  title: 'Features/Volume/VolumeControl',
  component: VolumeControl,
  decorators: [
    (Story) => (
      <GlobalAudioProvider>
        <VolumeProvider>
          <div style={{ width: 140 }}>
            <Story />
          </div>
        </VolumeProvider>
      </GlobalAudioProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

