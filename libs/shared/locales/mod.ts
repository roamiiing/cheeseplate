import { Injection } from 'shared/di'
import { LocaleStore } from './store.ts'

export * from './fs-store.ts'
export * from './store.ts'

export type LocaleStoreInjection = Injection<'localeStore', LocaleStore>
