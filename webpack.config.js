const path = require('path')
const resolve = (file) => path.resolve(__dirname, file)
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const TerserPlugin = require('terser-webpack-plugin')
const pkg = require('./package')

module.exports = {
  mode: 'production',
  entry: {
    index: resolve('src/index.js')
  },
  output: {
    path: resolve('dist'),
    library: pkg.name,
    libraryExport: 'default',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.js']
  },
  externals: {
    vue: {
      root: 'Vue',
      commonjs: 'vue',
      commonjs2: 'vue',
      amd: 'vue',
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader'
          }
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      }
    ],
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          safari10: true,
        },
      })
    ],
  },
}
