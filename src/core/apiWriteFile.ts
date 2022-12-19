import { writeFileSync, existsSync, mkdirSync } from "fs"
import path from "path"
export function writeFileAPI(filePath: string, content: string) {
    const baseDir = path.dirname(filePath)
    if (!existsSync(baseDir)) {//不存在则新建
        mkdirSync(baseDir)
    }
    try {
        writeFileSync(filePath, content, "utf8")
    } catch (err) {
        throw new Error(err as string)
    }
}