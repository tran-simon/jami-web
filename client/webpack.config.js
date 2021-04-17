'use strict'
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })
const HtmlWebpackPlugin = require('html-webpack-plugin')
const mode = process.env.NODE_ENV || 'development'

let entry = [path.resolve(__dirname, 'src', 'index.js')]
let plugins = [new HtmlWebpackPlugin({
    template: path.resolve(__dirname, 'src', 'index.ejs')
})]
let devtool = undefined

if (mode === 'development') {
    const webpack = require('webpack')
    entry = ['react-hot-loader/patch', 'webpack-hot-middleware/client', ...entry]
    plugins = [new webpack.HotModuleReplacementPlugin(), ...plugins]
    devtool = 'inline-source-map'
}
console.log(`Webpack configured for ${mode}`)

module.exports = {
    entry,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    devtool,
    mode,
    module: {
        rules: [
            {
                test: /\.jsx?/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env', {
                            useBuiltIns: 'entry',
                            corejs:{ version: "3.10", proposals: true },
                        }], '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.s[ac]ss$/i,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            }
        ]
    },
    plugins
}