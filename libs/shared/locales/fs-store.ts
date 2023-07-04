import { FileTreeContents, readFileTreeContents } from 'shared/fs'
import { isString } from 'shared/guards'
import { escapeAll } from 'shared/strings'
import { getRandomFromArray } from 'shared/random'
import hb from 'handlebars'
import { LocaleArguments, LocaleStore } from './store.ts'

const processTree = (
    tree: FileTreeContents,
    prefix = '',
    map: LocaleMap = new Map(),
) => {
    for (const name in tree) {
        const branch = tree[name]
        const key = prefix + name

        if (typeof branch === 'string') {
            map.set(
                key.replace(/\.\w+$/, ''),
                branch
                    .split('\n<!---->\n')
                    .map((html) =>
                        html
                            .trim()
                            .replaceAll('\n', ' ')
                            .replaceAll('<br />', '\n\n')
                    ),
            )
        } else {
            processTree(branch, key + '.', map)
        }
    }

    return map
}

const processArgs = (args: LocaleArguments): LocaleArguments => {
    if (isString(args)) return escapeAll(args)

    if (Array.isArray(args)) return args.map(processArgs)

    if (typeof args === 'object') {
        const processed: LocaleArguments = {}

        for (const key in args) {
            processed[key] = processArgs(args[key])
        }

        return processed
    }

    return args
}

type LocaleMap = Map<string, string[]>

const getLocaleMap = async (path: string) => {
    const contents = await readFileTreeContents(path)
    return processTree(contents)
}

export class FsLocaleStore implements LocaleStore {
    private constructor(private isDev: boolean, private path: string, private localeMap: LocaleMap) {}

    static async create(path: string, isDev = false): Promise<FsLocaleStore> {
        const contents = await readFileTreeContents(path)
        const map = processTree(contents)

        return new FsLocaleStore(isDev, path, map)
    }

    get(key: string, args: LocaleArguments = {}): string {
        return this.getRaw(key, processArgs(args))
    }

    getRaw(key: string, args: LocaleArguments = {}): string {
        if (this.isDev) {
            getLocaleMap(this.path).then((map) => this.localeMap = map)
        }

        const values = this.localeMap.get(key) ?? [key]
        const template = getRandomFromArray(values)
        return hb.compile(template, {
            noEscape: true,
        })(args)
    }
}
