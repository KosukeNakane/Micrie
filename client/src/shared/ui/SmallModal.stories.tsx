import { SmallModal } from '@shared/ui'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof SmallModal> = {
  title: 'Shared/SmallModal',
  component: SmallModal,
  args: {
    isOpen: true,
    title: 'Information',
    message: 'This is a small modal message.',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: { isOpen: true },
}

export const WithoutTitle: Story = {
  args: { isOpen: true, title: undefined },
}

