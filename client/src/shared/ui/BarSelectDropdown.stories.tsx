// [Story] shared/ui - BarSelectDropdown.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { BarCountProvider } from '@entities/bar-count'
import { BarSelectDropdown } from '@shared/ui'

import type { Meta, StoryObj } from '@storybook/react-vite'

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

