const parser = require('@babel/parser')
const traverse = require('@babel/traverse')
const types = require('@babel/types')
const generator = require('@babel/generator')
const fs = require('fs')
const path = require('path')
const sourceCode = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8')
// const ast = parser.parse(sourceCode, { sourceType: "module" })
// traverse.default(ast, {
//     CallExpression: (nodePath) => {
//         const { node } = nodePath
//         if(node.callee.name==="require"){
//             console.log(node);
//         }
//     }
// })