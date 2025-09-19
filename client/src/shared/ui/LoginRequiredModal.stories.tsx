// [Story] shared/ui - LoginRequiredModal.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { LoginRequiredModal } from '@shared/ui'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof LoginRequiredModal> = {
  title: 'Shared/LoginRequiredModal',
  component: LoginRequiredModal,
  argTypes: {
    onClose: { action: 'closed' },
    onLogin: { action: 'login' },
  },
  args: {
    isOpen: true,
    message: 'この機能を使用するにはログインが必要です。',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    ...meta.args,
    isOpen: true,
    onClose: () => console.log('Closed'),
    onLogin: () => console.log('Login'),
  },
}
