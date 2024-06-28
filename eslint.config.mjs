import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import jestPlugin from 'eslint-plugin-jest'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    files: ['__tests__/**'],
    ...jestPlugin.configs['flat/recommended'],
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      'jest/unbound-method': 'error',
      '@typescript-eslint/unbound-method': 'off'
    }
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ]
    }
  },
  {
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json', '__tests__/tsconfig.json']
      }
    }
  },
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/coverage',
      'lib/**',
      'eslint.config.mjs'
    ]
  }
)
