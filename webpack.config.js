const path = require('path');
const inputPath = path.resolve(__dirname, 'client');
const outputPath = path.resolve(__dirname, 'public');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: {
    app: [path.resolve(inputPath, 'scripts/snake.js')]
  },
  output: {
    path: outputPath,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query:
        {
          presets: ['stage-0', 'es2015']
        }
      },
      {
        test: /\.html$/,
        loader: 'file'
      },
      {
        test: /\.scss$|\.css$/,
        loader: 'style!css!sass'
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.eot$/,
        loader: 'file'
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'client/index.html' }])
  ]
};
