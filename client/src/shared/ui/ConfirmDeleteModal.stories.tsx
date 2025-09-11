import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConfirmDeleteModal } from '@shared/ui'

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

