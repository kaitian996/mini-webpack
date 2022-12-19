import { existsSync } from 'fs'
export function toUnixPath(path: string) {
    return path.replace(/\\/g, '/')
}

export function tryExtensions(modulePath: string, extensions: string[] | string) {
    if (existsSync(modulePath)) {
        return modulePath
    }
    for (let i = 0; i < extensions.length; i++) {
        const filePath = modulePath + extensions[i]
        if (existsSync(filePath)) {
            return filePath
        }
    }
    throw new Error(`无法找到 ${modulePath}`)
}