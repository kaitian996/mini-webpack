import { SyncHook } from '../hooks/index'
import { toUnixPath } from '../utils/index'
import path from 'path'
import { readFileSync } from 'fs'
const baseDir = toUnixPath(process.cwd())  //cmd在哪里执行的命令，basedir即是该目录

class Compilation {

    public options: any
    public modules: any[]
    public chunks: any[]
    public assets: any[]
    public fileDependences: string[]

    constructor(webpackOptions: any) {
        this.options = webpackOptions //配置
        this.modules = []   //模块
        this.chunks = [] //块
        this.assets = []    //资源
        this.fileDependences = []  //文件依赖
    }
    private buildModule(name: string, modulePath: string) {
        let sourceCode = readFileSync(modulePath, "utf8")
        const moduleId = './' + path.posix.relative(baseDir, modulePath)
        const module = {
            id: moduleId,
            names: [name],
            dependencies: [],
            _source: ''
        }
        //调用loader
        const loaders: Function[] = []
        const { rules = [] } = this.options.module
        rules.forEach((rule: { test: RegExp; use: Function[] }) => {
            const { test, use } = rule
            if (modulePath.match(test)) {//匹配了loader的正则表达式
                loaders.push(...use)
            }
        })
        sourceCode = loaders.reduceRight((code, loader) => {
            return loader(code)
        }, sourceCode)

        return module
    }
    public build(callback: Function) {
        //找到入口文件
        let entry: any = {}
        if (typeof this.options.entry === 'string') { //单文件入口 entry应为:{main:'index.js'}
            entry.main = this.options.entry
        } else {
            entry = this.options.entry
        }
        //从入口文件入口出发，调用配置的loader规则
        for (const entryName in entry) {
            //entryName=main
            const entryFilePath = path.posix.join(baseDir, entry[entryName]) //拼接好的入口文件绝对路径
            this.fileDependences.push(entryFilePath)  //依赖文件
            const entryModule = this.buildModule(entryName, entryFilePath) //开始编译
            this.modules.push(entryModule)
        }
        //编译完成执行回调
        callback()//钩子函数
    }
}
class Compiler {
    public hooks: { run: SyncHook; done: SyncHook }
    public options: any;
    constructor(webpackOptions: any) {
        this.hooks = {
            run: new SyncHook(),
            done: new SyncHook()
        }
        this.options = webpackOptions
    }
    public compile(callback: Function) {
        const compilation = new Compilation(this.options)
        compilation.build(callback)
    }
    public run(callback: Function) {
        this.hooks.run.call() //开始编译
        const onCompiled = () => {
            this.hooks.done.call()
        }
        this.compile(onCompiled)
    }
}

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