import { LoginModal } from './LoginModal';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'widgets/LoginModal',
  component: LoginModal,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { action: 'closed' },
    onSubmit: { action: 'submitted' },
    onRegister: { action: 'registered' },
    onForgotPassword: { action: 'forgotPassword' },
    onOAuth: { control: 'object' },
  },
  args: {
    isOpen: true,
    onOAuth: {
      google: () => alert('Google OAuth'),
      github: () => alert('GitHub OAuth'),
    },
  },
} satisfies Meta<typeof LoginModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ...meta.args,
    isOpen: true,
    onClose: () => console.log('Closed'),
    onSubmit: ({ email, password }) => console.log('Submit:', email, password),
    onRegister: ({ email, password, username }) => console.log('Register:', email, password, username),
    onForgotPassword: (email) => console.log('Forgot Password:', email),
  },
};

export const SignUpMode: Story = {
  args: {
    ...meta.args,
    isOpen: true,
    onClose: () => console.log('Closed'),
    onSubmit: ({ email, password }) => console.log('Submit:', email, password),
    onRegister: ({ email, password, username }) => console.log('Register:', email, password, username),
    onForgotPassword: (email) => console.log('Forgot Password:', email),
  },
};
