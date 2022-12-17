const { load1, load2 } = require('./loaders')
const { WebPackRunPlugin, WebPackDonePlugin } = require('./plugin')
module.exports = {
    entry: './src/main.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [load1, load2]
            }
        ]
    },
    plugins: [new WebPackRunPlugin(), new WebPackDonePlugin()]
}