const { load1, load2 } = require('./loaders')
const { WebPackRunPlugin, WebPackDonePlugin } = require('./plugin')
module.exports = {
    entry: './src/main.js', //打包入口
    output: {               //打包出口
        path: './dist',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: []
            }
        ]
    },
    plugins: [new WebPackRunPlugin(), new WebPackDonePlugin()]
}