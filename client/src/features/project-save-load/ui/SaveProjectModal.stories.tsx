import type { Meta, StoryObj } from '@storybook/react-vite';
import { SaveProjectModal } from './SaveProjectModal';

const meta = {
  title: 'features/SaveProjectModal',
  component: SaveProjectModal,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    initialName: { control: 'text' },
    onClose: { action: 'closed' },
    onSubmit: { action: 'submitted' },
  },
  args: {
    isOpen: true,
    initialName: 'My Project',
  },
} satisfies Meta<typeof SaveProjectModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ...meta.args,
    isOpen: true,
    onClose: () => {},
    onSubmit: (name) => console.log('Submitted:', name),
  },
};

export const NoInitialName: Story = {
  args: {
    ...meta.args,
    initialName: undefined,
    isOpen: true,
    onClose: () => {},
    onSubmit: (name) => console.log('Submitted:', name),
  },
};
