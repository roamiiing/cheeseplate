export type Injection<Name extends string, Value> = Record<Name, Value>

export type ValueOf<I> = I extends Injection<infer _, infer Value> ? Value : never
