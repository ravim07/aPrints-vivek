const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require("webpack");

module.exports = {
  mode: 'production',
  entry: {
    "polyfills-ie": "./src/polyfills-ie.js"
  },
  devtool: "source-map",
  output: {
    path: path.join(__dirname, 'dist/aprintis-frontend'),
    filename: "[name].js"
  },
  optimization: {
    minimize: true,
    minimizer: [new UglifyJsPlugin({
      uglifyOptions: {
        warnings: false,
        parse: {},
        compress: {},
        mangle: true, // Note `mangle.properties` is `false` by default.
        output: null,
        toplevel: false,
        nameCache: null,
        ie8: false,
        keep_fnames: false,
      }
    })]
  }
};
