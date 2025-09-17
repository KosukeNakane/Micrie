// [Story] shared/ui - ConfirmUnsavedChangesModal.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { ConfirmUnsavedChangesModal } from '@shared/ui'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ConfirmUnsavedChangesModal> = {
  title: 'Shared/ConfirmUnsavedChangesModal',
  component: ConfirmUnsavedChangesModal,
  argTypes: {
    onSaveAndContinue: { action: 'saved and continued' },
    onDiscardAndContinue: { action: 'discarded and continued' },
    onCancel: { action: 'canceled' },
  },
  args: {
    isOpen: true,
    projectName: 'Untitled',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    ...meta.args,
    isOpen: true,
    onSaveAndContinue: () => console.log('Save and Continue'),
    onDiscardAndContinue: () => console.log('Discard and Continue'),
    onCancel: () => console.log('Cancel'),
  },
}
