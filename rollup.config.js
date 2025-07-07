import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import vue from 'rollup-plugin-vue';
import { copyFile } from 'fs/promises';
import { mkdir } from 'fs/promises';

// Custom plugin to copy CSS file
const copyCSS = () => ({
  name: 'copy-css',
  async buildEnd() {
    await mkdir('dist', { recursive: true });
    await copyFile('src/style.css', 'dist/style.css');
  }
});

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true
    }),
    copyCSS()
  ],
  external: ['markdown-it', 'vue']
}); 