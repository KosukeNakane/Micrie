import { LogoutConfirmModal } from './LogoutConfirmModal';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'widgets/LogoutConfirmModal',
  component: LogoutConfirmModal,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { action: 'closed' },
  },
  args: {
    isOpen: true,
  },
} satisfies Meta<typeof LogoutConfirmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        ...meta.args,
        isOpen: true,
        onClose: () => console.log('Closed'),
    },
};
