import type { Meta, StoryObj } from '@storybook/react-vite'
import { SimpleSelect } from '@shared/ui'
import React from 'react'

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
]

const meta: Meta<typeof SimpleSelect> = {
  title: 'Shared/SimpleSelect',
  component: SimpleSelect,
  args: {
    options,
    value: options[0],
    widthPx: 160,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? null)
    return <SimpleSelect {...args} value={value} onChange={setValue} />
  },
}

export const Narrow: Story = {
  args: { widthPx: 110 },
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? null)
    return <SimpleSelect {...args} value={value} onChange={setValue} />
  },
}

