// [Story] widgets/ui - ControlButton.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { ControlButton } from '@/widgets/recording/control-panel'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ControlButton> = {
  title: 'Widgets/Recording/ControlButton',
  component: ControlButton,
  args: {
    label: 'Mode',
    options: ['A', 'B', 'C'],
    value: 'A',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

