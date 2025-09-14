import { StyledArea } from '@shared/ui';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof StyledArea> = {
  title: 'Shared/StyledArea',
  component: StyledArea,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Glass styled container',
    style: { minWidth: 280 },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithContent: Story = {
  args: {
    children: (
      <div style={{ display: 'flex', gap: 8 }}>
        <div>Left</div>
        <div>Right</div>
      </div>
    ),
  },
};

