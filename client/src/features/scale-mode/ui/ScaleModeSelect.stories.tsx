// [Story] features/ui - ScaleModeSelect.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { ScaleModeProvider } from '@entities/scale-mode'

import { ScaleModeSelect } from '@/features/scale-mode'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ScaleModeSelect> = {
  title: 'Features/ScaleMode/ScaleModeSelect',
  component: ScaleModeSelect,
  decorators: [
    (Story) => (
      <ScaleModeProvider>
        <div style={{ width: 220 }}>
          <Story />
        </div>
      </ScaleModeProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

