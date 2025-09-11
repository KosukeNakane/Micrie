import type { Meta, StoryObj } from '@storybook/react-vite'
import { BarSelectDropdown } from '@shared/ui'
import { BarCountProvider } from '@entities/bar-count'

const meta: Meta<typeof BarSelectDropdown> = {
  title: 'Shared/BarSelectDropdown',
  component: BarSelectDropdown,
  decorators: [
    (Story) => (
      <BarCountProvider>
        <div style={{ padding: 24 }}>
          <Story />
        </div>
      </BarCountProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

