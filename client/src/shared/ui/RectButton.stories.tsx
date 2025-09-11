import type { Meta, StoryObj } from '@storybook/react-vite'
import { RectButton } from '@shared/ui'

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

