import type { Meta, StoryObj } from '@storybook/react-vite'
import SplitHoldResetButton from '@/features/effects/ui/SplitHoldResetButton'
import React from 'react'

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

