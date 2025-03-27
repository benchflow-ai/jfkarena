import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['.next', '**/.next/**', 'node_modules', '**/node_modules/**', 'migrations/**.json'],
  formatters: true,
  react: true,
})
