import type { Meta, StoryObj } from '@storybook/react-vite'
import EffectsButton from '@/features/effects/ui/EffectsButton'

const meta: Meta<typeof EffectsButton> = {
  title: 'Features/Effects/EffectsButton',
  component: EffectsButton,
  args: {
    label: 'FX',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ActiveLarge: Story = {
  args: { active: true, size: 56 },
}

