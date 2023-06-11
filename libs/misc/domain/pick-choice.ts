import { z } from 'zod'

export const PickChoice = z
    .string()
    .min(1, 'pick.errors.choice.min')
    .max(500, 'pick.errors.choice.max')
export type PickChoice = z.infer<typeof PickChoice>

export const PickChoicesArray = z
    .array(PickChoice)
    .min(2, 'pick.errors.choices.min')
    .max(50, 'pick.errors.choices.max')
export type PickChoicesArray = z.infer<typeof PickChoicesArray>
