import type { Meta, StoryObj } from '@storybook/react-vite'
import { VerticalFader } from '@/features/effects'
import React from 'react'

const meta: Meta<typeof VerticalFader> = {
  title: 'Features/Effects/VerticalFader',
  component: VerticalFader,
  args: {
    value: 0.4,
    label: 'GAIN',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [v, setV] = React.useState(args.value ?? 0)
    return <VerticalFader {...args} value={v} onChange={setV} onChangeEnd={setV} />
  },
}

export const SpringBack: Story = {
  render: (args) => {
    const [v, setV] = React.useState(0)
    return <VerticalFader {...args} value={v} onChange={setV} onChangeEnd={setV} springBack label="PITCH" />
  },
}

