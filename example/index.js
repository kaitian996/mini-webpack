const { webpack } = require('../dist/mini-webpack.cjs')

const webpackConfig = require('./webpack.config.js')
const compiler = webpack(webpackConfig)
compiler.run()