// [Story] features/ui - VolumeControlPanel.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { GlobalAudioProvider } from '@entities/audio'
import { VolumeProvider } from '@entities/volume'

import VolumeControlPanel from './VolumeControlPanel'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof VolumeControlPanel> = {
  title: 'Features/Volume/VolumeControlPanel',
  component: VolumeControlPanel,
  decorators: [
    (Story) => (
      <GlobalAudioProvider>
        <VolumeProvider>
          <div style={{ width: 480 }}>
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
