import { load } from 'std/dotenv/mod.ts'
import { z } from 'zod'

const Environment = z.object({
    DENO_ENV: z.enum(['development', 'production']).default('development'),
    CHEESEPLATE_BOT_TOKEN: z.string().min(1),
})

type Environment = z.infer<typeof Environment>

const getDevEnv = async (): Promise<Environment> => {
    const env = await load()
    return Environment.parseAsync(env)
}

const getProdEnv = (): Promise<Environment> => {
    const env = Deno.env.toObject()
    return Environment.parseAsync(env)
}

export const getEnv = (): Promise<Environment> => {
    const isDev = Deno.env.get('DENO_ENV') === 'development'

    if (isDev) return getDevEnv()

    return getProdEnv()
}
