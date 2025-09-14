// [Story] features/ui - EffectsButton.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import EffectsButton from './EffectsButton'

import type { Meta, StoryObj } from '@storybook/react-vite'

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
