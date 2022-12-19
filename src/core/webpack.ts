import { Compiler } from "./compiler"

export function webpack(webpackOptions: any) {
    const compiler = new Compiler(webpackOptions)
    //注册plugin
    const { plugins } = webpackOptions
    if (plugins) {
        for (const plugin of plugins) {
            plugin.apply(compiler)
        }
    }
    return compiler
}