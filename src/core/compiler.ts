import { SyncHook } from '../hooks/index'
import { toUnixPath, tryExtensions } from '../utils/index'
import path from 'path'
import { readFileSync, writeFileSync } from 'fs'
import parser from '@babel/parser'
import traverse from '@babel/traverse'
import types from '@babel/types'
import generator from '@babel/generator'
import { genCode } from './gencode'
import { writeFileAPI } from './apiWriteFile'

const baseDir = toUnixPath(process.cwd())  //cmd在哪里执行的命令，basedir即是该目录
class Compilation {

    public options: any
    public modules: { id: string; names: string[]; dependencies: { depModuleId: string; depModulePath: string; }[]; _source: string; }[]
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
            dependencies: [] as { depModuleId: string; depModulePath: string }[],
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
        //完成load后 通过babel找出依赖文件，通过require关键字 入口为./src/index.js 则模块目录为绝对目录
        const ast = parser.parse(sourceCode, { sourceType: "module" })
        traverse(ast, {
            CallExpression: (nodePath: any) => {
                const { node } = nodePath
                if (node.callee.name === "require") { //require语句
                    const depModuleName = node.arguments[0].value //依赖的文件名称
                    const dirName = path.posix.dirname(modulePath) //当前的文件目录 **/src
                    let depModulePath = path.posix.join(dirName, depModuleName) //依赖模块的绝对路径 **/src/a
                    const extensions = this.options.resolve?.extensions || ['.js'] //配置中的extension
                    depModulePath = tryExtensions(depModulePath, extensions) // **/src/a.js
                    this.fileDependences.push(depModulePath)
                    const depModuleId = "./" + path.posix.relative(baseDir, depModulePath)
                    //修改语法树路径
                    node.arguments = [types.stringLiteral(depModuleId)]
                    module.dependencies.push({
                        depModuleId,
                        depModulePath
                    })
                }
            }
        })
        //重新生成代码
        const { code } = generator(ast)
        module._source = code
        //对依赖进行编译
        module.dependencies.forEach(({ depModuleId, depModulePath }) => {
            const existModule = this.modules.find(module => module.id === depModuleId) //是否已经编译了            
            if (existModule) {
                existModule.names.push(name)
            } else {
                const depModule = this.buildModule(name, depModulePath)
                this.modules.push(depModule)
            }
        })
        //返回编译好的文件
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
            const entryFilePath = path.posix.join(baseDir, entry[entryName]) //拼接好的入口文件绝对路径 **/src/index.js
            this.fileDependences.push(entryFilePath)  //依赖文件
            const entryModule = this.buildModule(entryName, entryFilePath) //开始编译
            this.modules.push(entryModule)
            //所有模块编译完成后，根据依赖关系组装代码块，一般一个入口文件对应一个代码块
            const chunk = { //该入口文件的打包好的块
                name: entryName,
                entryModule,
                modules: this.modules.filter(module => module.names.includes(entryName))
            }
            this.chunks.push(chunk)
        }
        //素有的依赖组装完成后，输出文本
        this.chunks.forEach(chunk => {
            const fileName = this.options.output.filename.replace("[name]", chunk.name)
            this.assets[fileName] = genCode(chunk)
        })
        //编译完成执行回调
        callback(null, {
            chunks: this.chunks,
            modules: this.modules,
            assets: this.assets
        }, this.fileDependences)//钩子函数
    }
}
export class Compiler {
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
        const onCompiled = (err: any, stats: any, fileDependences: any) => {
            //写入文件
            for (const fileName in stats.assets) {
                const filePath = path.join(baseDir, this.options.output.path, fileName)
                writeFileAPI(filePath, stats.assets[fileName])
            }
            callback(err, {
                toJSON: () => stats
            })
            this.hooks.done.call()
        }
        this.compile(onCompiled)
    }
}

