import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScaleModeSelect } from '@/features/scale-mode'
import { ScaleModeProvider } from '@entities/scale-mode'

const meta: Meta<typeof ScaleModeSelect> = {
  title: 'Features/ScaleMode/ScaleModeSelect',
  component: ScaleModeSelect,
  decorators: [
    (Story) => (
      <ScaleModeProvider>
        <div style={{ width: 220 }}>
          <Story />
        </div>
      </ScaleModeProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

