import EffectsPanel from './EffectsPanel'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof EffectsPanel> = {
  title: 'Features/Effects/EffectsPanel',
  component: EffectsPanel,
}

export default meta
type Story = StoryObj<typeof meta>

export const WithContent: Story = {
  render: (args) => (
    <EffectsPanel {...args}>
      <div style={{ padding: 12 }}>Panel content goes here</div>
    </EffectsPanel>
  ),
}
