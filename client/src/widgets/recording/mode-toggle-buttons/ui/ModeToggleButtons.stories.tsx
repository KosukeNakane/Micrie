import { AnalysisModeProvider } from '@entities/analysis'

import { ModeToggleButtons } from '@/widgets/recording/mode-toggle-buttons'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ModeToggleButtons> = {
  title: 'Widgets/Recording/ModeToggleButtons',
  component: ModeToggleButtons,
  decorators: [
    (Story) => (
      <AnalysisModeProvider>
        <Story />
      </AnalysisModeProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

