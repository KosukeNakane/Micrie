// [Story] shared/ui - RectButton.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { RectButton } from '@shared/ui'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof RectButton> = {
  title: 'Shared/RectButton',
  component: RectButton,
  args: {
    label: 'Button',
    active: false,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Active: Story = {
  args: { active: true },
}

export const Wide: Story = {
  args: { label: 'Wide Button', widthPx: 240 },
}

