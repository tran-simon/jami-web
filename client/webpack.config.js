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
'use strict';

import CopyWebpackPlugin from 'copy-webpack-plugin';
import dotenv from 'dotenv';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '..', '.env') });

const mode = process.env.NODE_ENV || 'development';

let entry = [resolve(__dirname, 'src', 'index.tsx')];
let plugins = [
  new HtmlWebpackPlugin({
    template: '!!raw-loader!' + resolve(__dirname, 'src', 'index.ejs'),
    filename: 'index.ejs',
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: resolve(__dirname, 'public'),
        to: resolve(__dirname, 'dist'),
      },
    ],
  }),
];

let devtool = undefined;
let babelLoaderPlugins = ['@babel/plugin-transform-runtime'];

if (mode === 'development') {
  const webpack = (await import('webpack')).default;
  const ReactRefreshWebpackPlugin = (await import('@pmmmwh/react-refresh-webpack-plugin')).default;
  entry = ['webpack-hot-middleware/client', ...entry];
  plugins = [new webpack.HotModuleReplacementPlugin(), new ReactRefreshWebpackPlugin(), ...plugins];
  babelLoaderPlugins = [...babelLoaderPlugins, 'react-refresh/babel'];
  devtool = 'inline-source-map';
}
console.log(`Webpack configured for ${mode}`);

export default {
  entry,
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  devtool,
  mode,
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        resolve: {
          fullySpecified: false,
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: babelLoaderPlugins,
            presets: [
              [
                '@babel/preset-env',
                {
                  useBuiltIns: 'entry',
                  corejs: { version: '3.10', proposals: true },
                },
              ],
              [
                '@babel/preset-react',
                {
                  runtime: 'automatic',
                },
              ],
              ['@babel/preset-typescript'],
            ],
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        // test: /\.tsx?$/,
        test: /\.(js|jsx|ts|tsx)?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    modules: ['node_modules', resolve(__dirname)],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  plugins,
};
