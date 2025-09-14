// [Story] features/ui - ChordsEditor.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { GlobalAudioProvider } from '@/entities/audio';

import { ChordsEditor } from './ChordsEditor';

import type { Meta, StoryObj } from '@storybook/react';

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
