// [Story] shared/ui - NavBar.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { MemoryRouter } from 'react-router-dom'

import { NavBar } from '@shared/ui'

import type { Meta, StoryObj } from '@storybook/react-vite'

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

