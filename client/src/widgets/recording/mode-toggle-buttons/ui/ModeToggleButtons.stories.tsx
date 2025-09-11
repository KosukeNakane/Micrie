import type { Meta, StoryObj } from '@storybook/react-vite'
import { ModeToggleButtons } from '@/widgets/recording/mode-toggle-buttons'
import { AnalysisModeProvider } from '@entities/analysis'

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

