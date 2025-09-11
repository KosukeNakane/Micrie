import type { Meta, StoryObj } from '@storybook/react-vite'
import { ControlPanel } from '@/widgets/recording/control-panel'
import { ScaleModeProvider } from '@entities/scale-mode'

const meta: Meta<typeof ControlPanel> = {
  title: 'Widgets/Recording/ControlPanel',
  component: ControlPanel,
  decorators: [
    (Story) => (
      <ScaleModeProvider>
        <div style={{ padding: 16 }}>
          <Story />
        </div>
      </ScaleModeProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

