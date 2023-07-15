import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/testing/asserts.ts'

import { parseCliArgs } from './cli.ts'

type TestCase = {
    name: string
    input: string
    expected: {
        head: string
        args: Record<string, string>
    }
}

const testCases: TestCase[] = [
    {
        name: 'some complicated input',
        input: 'hello world --arg=1 -arg2  something –arg3  another \ --arg4=aboba',
        expected: {
            head: 'hello world',
            args: {
                arg: '1',
                arg2: 'something',
                arg3: 'another',
                arg4: 'aboba',
            },
        },
    },
]

describe('command line args parser', () => {
    testCases.forEach((testCase) => {
        it(`should parse ${testCase.name}`, () => {
            const result = parseCliArgs(testCase.input)

            assertEquals(result.head, testCase.expected.head, 'head')
            ;[...result].forEach(([key, value]) => assertEquals(value, testCase.expected.args[key], `arg ${key}`))

            Object.entries(testCase.expected.args).forEach(([key, value]) =>
                assertEquals(result.getByAliases(key), value, `arg ${key}`)
            )
        })
    })
})
