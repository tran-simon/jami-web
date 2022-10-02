import commonjs from '@rollup/plugin-commonjs';
import run from '@rollup/plugin-run';
import typescript from '@rollup/plugin-typescript';

const dev = process.env.NODE_ENV !== 'production';

export default (async () => ({
  input: 'app.ts',
  output: { file: 'dist/bundle.js', sourcemap: true },
  plugins: [typescript(), commonjs(), dev && run(), !dev && (await import('rollup-plugin-terser')).terser()],
}))();
