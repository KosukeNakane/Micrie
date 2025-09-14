import { LoginRequiredModal } from '@shared/ui'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof LoginRequiredModal> = {
  title: 'Shared/LoginRequiredModal',
  component: LoginRequiredModal,
  args: {
    isOpen: true,
    message: 'この機能を使用するにはログインが必要です。',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: { isOpen: true },
}

