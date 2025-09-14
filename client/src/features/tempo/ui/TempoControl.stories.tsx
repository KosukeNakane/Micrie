import { TempoProvider } from '@entities/tempo'

import { TempoControl } from '@/features/tempo'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof TempoControl> = {
  title: 'Features/Tempo/TempoControl',
  component: TempoControl,
  decorators: [
    (Story) => (
      <TempoProvider>
        <div style={{ width: 160 }}>
          <Story />
        </div>
      </TempoProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

