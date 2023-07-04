import { z } from 'zod'

export const KandinskyPrompt = z
    .string({
        required_error: 'kandinsky.errors.prompt.required',
    })
    .min(1, 'kandinsky.errors.prompt.required')
    .max(500, 'kandinsky.errors.prompt.max')
    .transform((val) => val.replace(/\s/g, ' '))
    .brand('KandinskyPrompt')

export type KandinskyPrompt = z.infer<typeof KandinskyPrompt>

export const KandinskyStyle = z.enum([
    'anime',
    'detailed',
    'cyberpunk',
    'kandinsky',
    'aivazovsky',
    'malevich',
    'picasso',
    'goncharova',
    'classicism',
    'renaissance',
    'oil',
    'pencil',
    'digital',
    'medieval',
    'soviet',
    '3d',
    'cartoon',
    'studio',
    'portrait',
    'mosaic',
    'iconography',
    'khokhloma',
    'christmas',
])

export type KandinskyStyle = z.infer<typeof KandinskyStyle>

export const KandinskyInput = z.object({
    prompt: KandinskyPrompt,
    style: KandinskyStyle.optional(),
})

export type KandinskyInput = z.infer<typeof KandinskyInput>
