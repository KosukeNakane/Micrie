// [Story] shared/ui - ConfirmDeleteModal.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { ConfirmDeleteModal } from '@shared/ui'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ConfirmDeleteModal> = {
  title: 'Shared/ConfirmDeleteModal',
  component: ConfirmDeleteModal,
  argTypes: {
    onCancel: { action: 'canceled' },
    onConfirm: { action: 'confirmed' },
  },
  args: {
    isOpen: true,
    projectName: 'My Project',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    ...meta.args,
    isOpen: true,
    onCancel: () => console.log('Canceled'),
    onConfirm: () => console.log('Confirmed'),
  },
}
