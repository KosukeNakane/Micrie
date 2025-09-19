// [Story] shared/ui - toaster.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { ToasterHost, toaster } from '@shared/ui'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ToasterHost> = {
  title: 'Shared/Toaster',
  component: ToasterHost,
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <button onClick={() => toaster.create({ title: 'Saved', description: 'Project saved successfully.' })}>
        Show toast
      </button>
      <ToasterHost />
    </div>
  ),
}

