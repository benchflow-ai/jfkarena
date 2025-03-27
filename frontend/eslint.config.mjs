import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['.next', '**/.next/**', 'node_modules', '**/node_modules/**', 'migrations'],
  formatters: true,
  react: true,
})
