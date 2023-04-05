import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'

export default defineConfig([
  {
    input: './index.ts',
    output: {
      file: './dist/index.mjs',
      format: 'module',
      sourcemap: true
    },
    plugins: [ typescript({ tsconfig: './tsconfig.json' })]
  },
  {
    input: './index.ts',
    output: {
      file: './dist/index.cjs',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [typescript({ tsconfig: './tsconfig.json' })]
  },
  {
    input: './index.ts',
    output: {
      file: './dist/index.js',
      format: 'umd',
      sourcemap: true,
      name: 'index.js'
    },
    plugins: [typescript({ tsconfig: './tsconfig.json' })]
  }
])
