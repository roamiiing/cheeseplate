import { z } from 'zod'

export const KandinskyPrompt = z
    .string({
        required_error: 'kandinsky.errors.prompt.required',
    })
    .min(1, 'kandinsky.errors.prompt.required')
    .max(5000, 'kandinsky.errors.prompt.max')
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

const Values = KandinskyStyle.Values

const STYLE_TO_PROMPT: Record<KandinskyStyle, string> = {
    [Values['3d']]: 'Unreal Engine rendering, 3d render, photorealistic, digital concept art, octane render, 4k HD',
    [Values.detailed]: '4k, ultra HD, detailed phot',
    [Values.aivazovsky]: 'painted by Aivazovsky',
    [Values.anime]: 'in anime style',
    [Values.cartoon]: 'as cartoon, picture from cartoon',
    [Values.christmas]: 'christmas, winter, x-mas, decorations, new year eve, snowflakes, 4k',
    [Values.classicism]: 'classicism painting, 17th century, trending on artstation, baroque painting',
    [Values.cyberpunk]: 'in cyberpunk style, futuristic cyberpunk',
    [Values.digital]:
        'high quality, highly detailed, concept art, digital painting, by greg rutkowski trending on artstation',
    [Values.goncharova]: 'painted by Goncharova, Russian avant-garde, futurism, cubism, suprematism',
    [Values.iconography]: 'in the style of a wooden christian medieval icon in the church',
    [Values.kandinsky]: 'painted by Vasily Kandinsky, abstractionis',
    [Values.khokhloma]: 'in Russian style, Khokhloma, 16th century, marble, decorative, realistic',
    [Values.malevich]:
        'Malevich, suprematism, avant-garde art, 20th century, geometric shapes , colorful, Russian avant-garde',
    [Values.medieval]: 'medieval painting, 15th century, trending on artstation',
    [Values.mosaic]: 'as tile mosaic',
    [Values.oil]: 'like oil painting',
    [Values.picasso]: 'Cubist painting by Pablo Picasso, 1934, colorful',
    [Values.pencil]: 'pencil art, pencil drawing, highly detailed',
    [Values.portrait]: '50mm portrait photography, hard rim lighting photography',
    [Values.renaissance]: 'painting, renaissance old master royal collection, artstation',
    [Values.soviet]: 'picture from soviet cartoons',
    [Values.studio]:
        'glamorous, emotional ,shot in the photo studio, professional studio lighting, backlit, rim lighting, 8k',
}

export const getInjectedPrompt = (input: KandinskyInput): KandinskyInput => {
    const { style, prompt } = input

    const injectedPrompt = style ? STYLE_TO_PROMPT[style] : undefined

    return {
        prompt: injectedPrompt ? `${injectedPrompt}, ${prompt}` as KandinskyPrompt : prompt,
        style,
    }
}
