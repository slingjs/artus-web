import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'
import { globSync } from 'glob'

export default defineConfig([
  {
    input: globSync(['*.ts', '!(node_modules|dist)/*.ts']),
    output: {
      dir: './dist',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: './',
      sourcemap: true,
      // Rename all ts files to .cjs
      entryFileNames: i => i.name + '.cjs'
    },
    external: ['uuid'],
    plugins: [
      nodeResolve({ browser: false, moduleDirectories: ['uuid'], preferBuiltins: false }),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },
  {
    input: globSync(['*.ts', '!(node_modules|dist)/*.ts']),
    output: {
      dir: './dist',
      format: 'module',
      preserveModules: true,
      preserveModulesRoot: './',
      sourcemap: true,
      // Rename all ts files to .mjs
      entryFileNames: i => i.name + '.mjs'
    },
    external: ['uuid'],
    plugins: [
      nodeResolve({ browser: false, moduleDirectories: ['uuid'], preferBuiltins: false }),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },
  {
    input: globSync(['*.ts', '!(node_modules|dist)/*.ts']),
    output: {
      dir: './dist',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: './',
      sourcemap: true,
      // Rename all ts files to .mjs
      entryFileNames: i => i.name + '.esm.js'
    },
    plugins: [nodeResolve({ preferBuiltins: false, browser: true }), typescript({ tsconfig: './tsconfig.json' })]
  },
  {
    input: './index.ts',
    output: {
      file: './dist/index.umd.js',
      format: 'umd',
      sourcemap: true,
      name: 'index.umd.js'
    },
    plugins: [nodeResolve({ preferBuiltins: false, browser: true }), typescript({ tsconfig: './tsconfig.json' })]
  }
])
