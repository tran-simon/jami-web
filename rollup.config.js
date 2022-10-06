/*
 * Copyright (C) 2022 Savoir-faire Linux Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.  If not, see
 * <https://www.gnu.org/licenses/>.
 */
import commonjs from '@rollup/plugin-commonjs';
import run from '@rollup/plugin-run';
import typescript from '@rollup/plugin-typescript';

const dev = process.env.NODE_ENV !== 'production';

export default (async () => ({
  input: 'app.ts',
  output: { file: 'dist/bundle.js', sourcemap: true },
  plugins: [typescript(), commonjs(), dev && run(), !dev && (await import('rollup-plugin-terser')).terser()],
}))();