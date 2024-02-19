import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    {
      builder: 'rollup',
      input: './src/adaptors/fetch',
      outDir: 'dist/adaptors/fetch',
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
