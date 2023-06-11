import { readAll } from 'std/streams/mod.ts'
import {} from 'std/fs/mod.ts'
import { join } from 'std/path/mod.ts'
import { exists } from 'shared/guards'

export type FileTree = {
    [_: string]: null | FileTree
}

export type FileTreeContents = {
    [_: string]: string | FileTreeContents
}

export const readFileUtf8 = async (path: string): Promise<string> => {
    const file = await Deno.open(path)
    const decoder = new TextDecoder('utf-8')
    const content = decoder.decode(await readAll(file))

    return content
}

export const readFileTree = async (
    path: string,
    maxDepth = 10,
): Promise<FileTree> => {
    const tree: FileTree = {}
    if (maxDepth === 0) return tree

    for await (const dir of Deno.readDir(path)) {
        tree[dir.name] = dir.isDirectory
            ? await readFileTree(
                join(path, dir.name),
                maxDepth - 1,
            )
            : null
    }

    return tree
}

export const readFileTreeContents = async (
    path = '',
    tree: FileTree | null = null,
): Promise<FileTreeContents> => {
    tree ??= await readFileTree(path)
    const contents: FileTreeContents = {}

    for (const name in tree) {
        const branch = tree[name]
        const subpath = join(path, name)

        if (exists(branch)) {
            contents[name] = await readFileTreeContents(subpath, branch)
        } else {
            contents[name] = await readFileUtf8(subpath)
        }
    }

    return contents
}
