const webpack = require('webpack')
const npmCfg = require('./package.json')

const banner = [
  `${npmCfg.name} v${npmCfg.version}`,
  `(c) ${new Date().getFullYear()} ${npmCfg.author}`,
  npmCfg.homepage,
].join('\n')

module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    output: {
      libraryExport: 'default',
    },
    plugins: [
      new webpack.BannerPlugin(banner),
    ],
  },
}
