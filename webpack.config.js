const path = require('path');
const basePath = path.resolve(__dirname);

module.exports = {
  entry: {
    silo: `${basePath}/src/silo.js`
  },

  output: {
    filename: '[name].js',
    path: `${basePath}/dist`
  },

  module: {
    rules:[{
      test: /\.js$/,
      loader: 'babel-loader',
      options: {presets:['@babel/env']}
    }]
  }
}