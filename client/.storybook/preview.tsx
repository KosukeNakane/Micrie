import { ChakraProvider, createSystem, defineConfig, defaultConfig } from '@chakra-ui/react'
import React from 'react'

import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  decorators: [
    (Story) => {
      const config = defineConfig({
        globalCss: {
          'html, body': {
            bg: 'gray.100',
            color: 'gray.800',
          },
        },
      })
      const system = createSystem(defaultConfig, config)
      return (
        <ChakraProvider value={system}>
          <div style={{ padding: 16 }}>
            <Story />
          </div>
        </ChakraProvider>
      )
    },
  ],
};

export default preview;
