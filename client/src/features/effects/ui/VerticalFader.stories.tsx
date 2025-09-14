// [Story] features/ui - VerticalFader.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import React from 'react'

import { VerticalFader } from '@/features/effects'

import type { Meta, StoryObj } from '@storybook/react-vite'

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

