import json from '@rollup/plugin-json'
import ts from 'rollup-plugin-typescript2'
import resolvePlugin from '@rollup/plugin-node-resolve'
import path from 'path'

//工具函数，能拿到当前包下的文件
const packageJson = require('./package.json')
const resolve = p => path.resolve(__dirname, p)
const buildOptions = packageJson.buildOptions || {}
const fileName = 'mini-webpack'
const moduleName = buildOptions.name

function createConfig(buildOptions, fileName, moduleName) {
    const ouputOptions = {
        "esm-bundler": {
            file: resolve(`dist/${fileName}.esm-bundler.js`),
            format: 'es'
        },
        "esm-browser": {
            file: resolve(`dist/${fileName}.esm-browser.js`),
            format: 'es'
        },
        "cjs": {
            file: resolve(`dist/${fileName}.cjs.js`),
            format: 'cjs'
        },
        "global": {
            file: resolve(`dist/${fileName}.global.js`),
            format: 'iife'
        }
    }
    return buildOptions.formats.map(format => {
        const output = ouputOptions[format]
        output.name = moduleName
        output.sourcemap = true
        return {
            input: resolve('src/index.ts'),
            output,
            plugins: [
                json(),
                ts({
                    tsconfig: path.resolve(__dirname, 'tsconfig.json')
                }),
                resolvePlugin()
            ]
        }
    })
}
export default createConfig(buildOptions, fileName, moduleName)