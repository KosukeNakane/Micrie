import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConfirmUnsavedChangesModal } from '@shared/ui'

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

