const path = require('path');

module.exports = {
  entry: './source/app.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, 'source')],
        use: 'ts-loader',
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    publicPath: '',
    filename: 'bundle.js',
    path: path.resolve(__dirname, ''),
  },
};