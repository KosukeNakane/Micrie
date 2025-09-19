import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserProfileModal } from './UserProfileModal';
import { useAuthStore } from '@/entities/user';
import { useEffect } from 'react';

const meta = {
  title: 'widgets/UserProfileModal',
  component: UserProfileModal,
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
  decorators: [
    (Story, context) => {
      // @ts-ignore
      const { user } = context.args;
      const { set } = useAuthStore.getState();
      useEffect(() => {
        set({ user });
      }, [user, set]);
      return <Story />;
    },
  ],
} satisfies Meta<typeof UserProfileModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Closed'),
    // @ts-ignore
    user: {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      providerData: [{ providerId: 'google.com' }],
    },
  },
};

export const NoProvider: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Closed'),
    // @ts-ignore
    user: {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      providerData: [],
    },
  },
};
