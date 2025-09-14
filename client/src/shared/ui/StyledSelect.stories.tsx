// [Story] shared/ui - StyledSelect.stories.tsx
// 役割: Storybook用のドキュメント/検証用UI
import { StyledSelect } from '@shared/ui'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof StyledSelect> = {
  title: 'Shared/StyledSelect',
  component: StyledSelect,
  args: {
    children: [
      <option key="1" value="1">One</option>,
      <option key="2" value="2">Two</option>,
      <option key="3" value="3">Three</option>,
    ],
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { active: false },
}

export const Active: Story = {
  args: { active: true },
}

export const WithWrapper: Story = {
  render: (args) => (
    <StyledSelect.Wrapper>
      <StyledSelect {...args} defaultValue="1" />
      <StyledSelect.DropdownMenu>
        This is a custom dropdown area.
      </StyledSelect.DropdownMenu>
    </StyledSelect.Wrapper>
  ),
}

