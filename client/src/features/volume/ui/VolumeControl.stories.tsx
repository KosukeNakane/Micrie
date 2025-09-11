import type { Meta, StoryObj } from '@storybook/react-vite'
import { VolumeControl } from '@/features/volume'
import { GlobalAudioProvider } from '@entities/audio'
import { VolumeProvider } from '@entities/volume'

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

