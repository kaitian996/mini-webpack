class WebPackRunPlugin {
    apply(compiler) {
        compiler.hooks.run.tap('plugin1', () => {
            console.log('run plugin run');
        })
    }
}
class WebPackDonePlugin {
    apply(compiler) {
        compiler.hooks.done.tap('plugin done', () => {
            console.log('run plugin done');
        })
    }
}
module.exports = {
    WebPackDonePlugin,
    WebPackRunPlugin
}