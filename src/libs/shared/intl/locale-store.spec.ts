import { it, describe, expect } from 'vitest'

import { LocaleStoreImpl } from './locale-store'

describe('LocaleStoreImpl', () => {
  it('should return key if key is not found', () => {
    const store = new LocaleStoreImpl()
    expect(store.get('foo')).toBe('foo')
  })

  it('should return value if key is found', () => {
    const store = new LocaleStoreImpl()
    store.load({
      foo: 'bar',
    })
    expect(store.get('foo')).toBe('bar')
  })

  it('should return random value if key is found and value is an array', () => {
    const store = new LocaleStoreImpl()
    store.load({
      foo: ['bar', 'baz'],
    })
    expect(store.get('foo')).toMatch(/bar|baz/)
  })

  it('should return interpolated value if key is found and value is a string', () => {
    const store = new LocaleStoreImpl()
    store.load({
      foo: 'bar {0} baz {1}',
    })
    expect(store.get('foo', 'qux', 'quux')).toBe('bar qux baz quux')
  })

  it('should return interpolated value if key is found and value is a string with nested keys', () => {
    const store = new LocaleStoreImpl()
    store.load({
      foo: {
        bar: 'baz {0} qux {1}',
      },
    })
    expect(store.get('foo.bar', 'quux', 'quuz')).toBe('baz quux qux quuz')
  })

  it('should return interpolated value if key is found and value is a string with nested keys and array', () => {
    const store = new LocaleStoreImpl()
    store.load({
      foo: {
        bar: {
          baz: ['qux {0} quux {1}', 'quuz {0} corge {1}'],
        },
      },
    })
    expect(store.get('foo.bar.baz', 'grault', 'garply')).toMatch(
      /qux grault quux garply|quuz grault corge garply/,
    )
  })

  it('should return interpolated value if key is found and value is a string with nested keys and array with nested keys', () => {
    const store = new LocaleStoreImpl()
    store.load({
      foo: {
        bar: {
          baz: {
            qux: ['quux {0} quuz {1}', 'corge {0} grault {1}'],
          },
        },
      },
    })
    expect(store.get('foo.bar.baz.qux', 'garply', 'waldo')).toMatch(
      /quux garply quuz waldo|corge garply grault waldo/,
    )
  })
})
