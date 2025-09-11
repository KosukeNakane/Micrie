import type { Meta, StoryObj } from '@storybook/react-vite'
import EffectsPanel from '@/features/effects/ui/EffectsPanel'

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

