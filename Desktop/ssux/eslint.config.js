import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
          rules: {
        // Forbid hardcoded color values and sizing values
        'no-restricted-syntax': [
          'error',
          {
            selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
            message: 'Use CSS variables from variables.json instead of hardcoded hex colors'
          },
          {
            selector: 'Literal[value=/^rgb\\(/]',
            message: 'Use CSS variables from variables.json instead of hardcoded rgb colors'
          },
          {
            selector: 'Literal[value=/^hsl\\(/]',
            message: 'Use CSS variables from variables.json instead of hardcoded hsl colors'
          },
          {
            selector: 'Literal[value=/^[1-9]\\d*px$/]',
            message: 'Use CSS variables from variables.json instead of hardcoded pixel values'
          },
          {
            selector: 'Literal[value=/^[1-9]\\d*rem$/]',
            message: 'Use CSS variables from variables.json instead of hardcoded rem values'
          }
        ]
      }
  },
])
