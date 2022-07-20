// prettier-ignore
export enum Module {
  General = 1 << 1,
  Users   = 1 << 2,
  Tags    = 1 << 3,
  Random  = 1 << 4,
  Neuro   = 1 << 5,
}

export const getModulesFromMask = (mask: number) =>
  Object.values(Module).filter(val => !!(mask & (val as number))) as Module[]
