// [Story] features/ui - SplitHoldResetButton.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import React from 'react'

import SplitHoldResetButton from './SplitHoldResetButton'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof SplitHoldResetButton> = {
  title: 'Features/Effects/SplitHoldResetButton',
  component: SplitHoldResetButton,
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [hold, setHold] = React.useState(false)
    return (
      <SplitHoldResetButton
        {...args}
        holdActive={hold}
        onToggleHold={() => setHold((v) => !v)}
        onReset={() => setHold(false)}
      />
    )
  },
}
