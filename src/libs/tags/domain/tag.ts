import { z } from 'zod'

export const TAG_SYMBOL = '#'

export const ALLOWED_SYMBOLS = '[\\w]',
  TAG_REGEX = new RegExp(`\\${TAG_SYMBOL}${ALLOWED_SYMBOLS}+`, 'gi'),
  ALLOWED_SYMBOLS_REGEX = new RegExp(`^${ALLOWED_SYMBOLS}+$`, 'gi')

export const TagWithoutSymbol = z
  .string()
  .min(2, 'Слишком короткий тег! Минимум 2 символа')
  .max(20, 'Слишком длинный тег! Максимум 20 символов')
  .regex(
    ALLOWED_SYMBOLS_REGEX,
    'Неверный формат! Тег может содержать латинские буквы, кириллицу, цифры и _',
  )

export const ALL_TAG = 'all'

export const RESERVED_TAGS = [ALL_TAG]

export const guardReservedTags = (tag: string) => !RESERVED_TAGS.includes(tag)
