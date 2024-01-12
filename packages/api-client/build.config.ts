import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    {
      builder: 'rollup',
      input: './src/adaptors',
      outDir: 'dist/adaptors/',
    },
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
  alias: {
    '~/*': './src/*',
  },
})
