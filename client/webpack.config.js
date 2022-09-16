'use strict'

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import dotenv from 'dotenv'
dotenv.config({ path: resolve(__dirname, '..', '.env') })

import { resolve } from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
const mode = process.env.NODE_ENV || 'development'

let entry = [resolve(__dirname, 'src', 'index.js')]
let plugins = [
  new HtmlWebpackPlugin({ template: '!!raw-loader!' + resolve(__dirname, 'src', 'index.ejs'), filename: 'index.ejs' }),
  new CopyWebpackPlugin({
    patterns: [{ from: resolve(__dirname, 'public'), to: resolve(__dirname, 'dist') }]
  })
]
let devtool = undefined
let babelLoaderPlugins = ["@babel/plugin-transform-runtime"]

if (mode === 'development') {
  const webpack = (await import('webpack')).default
  const ReactRefreshWebpackPlugin = (await import('@pmmmwh/react-refresh-webpack-plugin')).default
  entry = ['webpack-hot-middleware/client', ...entry]
  plugins = [new webpack.HotModuleReplacementPlugin(), new ReactRefreshWebpackPlugin(), ...plugins]
  babelLoaderPlugins = [...babelLoaderPlugins, "react-refresh/babel"]
  devtool = 'inline-source-map'
}
console.log(`Webpack configured for ${mode}`)

export default {
  entry,
  output: {
    path: resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/",
  },
  devtool,
  mode,
  module: {
    rules: [
      {
        // test: /\.jsx?/,
        test: /\.(js|jsx|ts|tsx)?$/,
        resolve: {
          fullySpecified: false,
        },
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: babelLoaderPlugins,
            presets: [
              [
                "@babel/preset-env",
                {
                  useBuiltIns: "entry",
                  corejs: { version: "3.10", proposals: true },
                },
              ],
              [
                "@babel/preset-react",
                {
                  runtime: "automatic",
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      },
      {
        // test: /\.tsx?$/,
        test: /\.(js|jsx|ts|tsx)?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    modules: ["node_modules", resolve(__dirname)],
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  plugins,
};