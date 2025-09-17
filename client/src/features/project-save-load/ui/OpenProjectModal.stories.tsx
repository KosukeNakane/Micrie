
import type { Meta, StoryObj } from '@storybook/react-vite'
import { OpenProjectModal } from './OpenProjectModal';

const meta = {
  title: 'features/OpenProjectModal',
  component: OpenProjectModal,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { action: 'closed' },
    fetchItems: { action: 'fetchItems' },
    onSelect: { action: 'selected' },
    onSelectLocal: { action: 'selectedLocal' },
  },
  args: {
    isOpen: true,
    fetchItems: async () => [
      { id: '1', name: 'Project A', updatedAt: Date.now() - 1000 * 60 * 60 * 24 },
      { id: '2', name: 'Project B', updatedAt: Date.now() - 1000 * 60 * 60 * 2 },
      { id: '3', name: 'Project C', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7 },
    ],
  },
} satisfies Meta<typeof OpenProjectModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ...meta.args,
    isOpen: true,
    onClose: () => {},
    onSelect: () => {},
    onSelectLocal: () => {},
  },
};

export const NoProjects: Story = {
  args: {
    ...meta.args,
    fetchItems: async () => [],
    isOpen: true,
    onClose: () => {},
    onSelect: () => {},
    onSelectLocal: () => {},
  },
};


