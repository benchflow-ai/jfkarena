/**
 * customized eslint config based on https://github.com/zolplay-cn/config-monorepo/blob/v2/packages/eslint/index.ts
 */

import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'
import nextPlugin from '@next/eslint-plugin-next'

import tailwindPlugin from 'eslint-plugin-tailwindcss'

const compat = new FlatCompat()

const base = antfu({
  formatters: true,
  react: true,
  stylistic: false,
}).overrideRules({
  'import/order': 'off',
  'perfectionist/sort-imports': 'off',
  'react-refresh/only-export-components': 'off',
})

base.append([eslintPluginPrettierRecommended, eslintConfigPrettier])

base.append([
  ...compat.config({
    plugins: ['svg-jsx'],
    rules: {
      'svg-jsx/camel-case-colon': 'error',
      'svg-jsx/camel-case-dash': 'error',
      'svg-jsx/no-style-string': 'error',
    },
  }),
])

base.append(tailwindPlugin.configs['flat/recommended'], {
  settings: {
    tailwindcss: {
      callees: ['classnames', 'clsxm', 'cn', 'tv', 'twx', 'twc'],
      config: './packages/ui/tailwind.config.ts',
    },
  },
})

base.append([
  {
    name: 'next',
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-duplicate-head': 'off',
      '@next/next/no-img-element': 'error',
      '@next/next/no-page-custom-font': 'off',
    },
  },
])

export default base
