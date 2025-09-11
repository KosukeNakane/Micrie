import type { Meta, StoryObj } from '@storybook/react-vite'
import { NavBar } from '@shared/ui'
import { MemoryRouter } from 'react-router-dom'

const meta: Meta<typeof NavBar> = {
  title: 'Shared/NavBar',
  component: NavBar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ padding: 24 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

