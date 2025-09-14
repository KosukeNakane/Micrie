// [Story] shared/ui - ConfirmDeleteModal.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { ConfirmDeleteModal } from '@shared/ui'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ConfirmDeleteModal> = {
  title: 'Shared/ConfirmDeleteModal',
  component: ConfirmDeleteModal,
  args: {
    isOpen: true,
    projectName: 'My Project',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: { isOpen: true },
}

