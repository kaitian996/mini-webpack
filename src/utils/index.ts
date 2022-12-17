export function toUnixPath(path: string) {
    return path.replace(/\\/g, '/')
}