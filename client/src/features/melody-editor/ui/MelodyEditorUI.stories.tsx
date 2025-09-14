import type { Meta, StoryObj } from '@storybook/react-vite'
import { MelodyEditorUI } from './MelodyEditorUI';

const meta: Meta<typeof MelodyEditorUI> = {
  title: 'Features/MelodyEditorUI',
  component: MelodyEditorUI,
};

export default meta;
type Story = StoryObj<typeof MelodyEditorUI>;

export const Default: Story = {
  render: () => <MelodyEditorUI />,
};

