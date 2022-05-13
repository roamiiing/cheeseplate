import { z } from 'zod'

export const PickChoice = z.string().min(1).max(50)
export type PickChoice = z.infer<typeof PickChoice>

export const PickChoicesArray = z
  .array(PickChoice)
  .min(
    2,
    'Укажите <b>как минимум 2</b> выбора. Выборы разделяйте либо запятыми, либо начинайте каждый выбор с новой строки',
  )
  .max(50)
export type PickChoicesArray = z.infer<typeof PickChoicesArray>
