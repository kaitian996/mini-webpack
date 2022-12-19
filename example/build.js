const { webpack } = require('../dist/mini-webpack.cjs.js')
const webpackConfig = require('./webpack.config.js')
const compiler = webpack(webpackConfig)
compiler.run((err, result) => {

})