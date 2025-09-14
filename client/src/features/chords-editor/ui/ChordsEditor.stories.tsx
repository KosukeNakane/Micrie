import type { Meta, StoryObj } from '@storybook/react';
import { ChordsEditor } from './ChordsEditor';
import { GlobalAudioProvider } from '@/entities/audio/model/GlobalAudioContext';

const meta: Meta<typeof ChordsEditor> = {
  title: 'Features/ChordsEditor',
  component: ChordsEditor,
};

export default meta;
type Story = StoryObj<typeof ChordsEditor>;

export const Default: Story = {
  render: () => (
    <GlobalAudioProvider>
      <ChordsEditor />
    </GlobalAudioProvider>
  ),
};
