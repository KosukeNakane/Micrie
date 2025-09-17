// [Story] shared/ui - SmallModal.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { SmallModal } from '@shared/ui'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof SmallModal> = {
  title: 'Shared/SmallModal',
  component: SmallModal,
  argTypes: {
    onClose: { action: 'closed' },
  },
  args: {
    isOpen: true,
    title: 'Information',
    message: 'This is a small modal message.',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    ...meta.args,
    isOpen: true,
    onClose: () => console.log('Closed'),
  },
}

export const WithoutTitle: Story = {
  args: {
    ...meta.args,
    isOpen: true,
    title: undefined,
    onClose: () => console.log('Closed'),
  },
}
