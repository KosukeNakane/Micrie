import type { Meta, StoryObj } from '@storybook/react-vite'
import { DrumPatternSelect } from '@/features/pattern-select'
import { DrumPatternProvider } from '@entities/pattern'

const meta: Meta<typeof DrumPatternSelect> = {
  title: 'Features/PatternSelect/DrumPatternSelect',
  component: DrumPatternSelect,
  decorators: [
    (Story) => (
      <DrumPatternProvider>
        <div style={{ width: 240 }}>
          <Story />
        </div>
      </DrumPatternProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

