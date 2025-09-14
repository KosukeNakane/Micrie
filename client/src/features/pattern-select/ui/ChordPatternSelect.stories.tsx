import { ChordPatternProvider } from '@entities/pattern'

import { ChordPatternSelect } from '@/features/pattern-select'

import type { Meta, StoryObj } from '@storybook/react-vite'

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

