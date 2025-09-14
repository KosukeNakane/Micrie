// [Story] shared/ui - ConfirmUnsavedChangesModal.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { ConfirmUnsavedChangesModal } from '@shared/ui'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ConfirmUnsavedChangesModal> = {
  title: 'Shared/ConfirmUnsavedChangesModal',
  component: ConfirmUnsavedChangesModal,
  args: {
    isOpen: true,
    projectName: 'Untitled',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: { isOpen: true },
}

