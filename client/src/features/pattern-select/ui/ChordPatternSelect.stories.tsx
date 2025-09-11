import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChordPatternSelect } from '@/features/pattern-select'
import { ChordPatternProvider } from '@entities/pattern'

const meta: Meta<typeof ChordPatternSelect> = {
  title: 'Features/PatternSelect/ChordPatternSelect',
  component: ChordPatternSelect,
  decorators: [
    (Story) => (
      <ChordPatternProvider>
        <div style={{ width: 240 }}>
          <Story />
        </div>
      </ChordPatternProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

