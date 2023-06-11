import { Bot, InputFile } from 'grammy'
import { Message } from 'grammy_types'
import { info } from 'std/log/mod.ts'
import { LocaleStore } from 'shared/locales'
import { stripFirst } from 'shared/strings'
import { exists } from 'shared/guards'
import { mapLocalizedZodError } from 'shared/validation'
import { DallePrompt } from 'misc/domain'
import { DalleStatus, DalleUseCase } from 'misc/application'

export type DalleHandlerDeps = {
    localeStore: LocaleStore
    dalleUseCase: DalleUseCase
}

export type RegisterDalleHandler = (bot: Bot) => Bot

export const registerDalleHandler =
    ({ localeStore, dalleUseCase }: DalleHandlerDeps): RegisterDalleHandler => (bot: Bot) => {
        bot.command('dalle', async (ctx) => {
            const validatedPrompt = await DallePrompt.safeParseAsync(stripFirst(ctx.message?.text ?? ''))

            if (!validatedPrompt.success) {
                return await ctx.reply(
                    mapLocalizedZodError(localeStore)(validatedPrompt.error),
                    {
                        reply_to_message_id: ctx.message?.message_id,
                        parse_mode: 'HTML',
                    },
                )
            }

            const prompt = validatedPrompt.data

            let messageToDelete: Message | null = null

            try {
                for await (const output of dalleUseCase(prompt)) {
                    switch (output.status) {
                        case DalleStatus.Wait: {
                            messageToDelete = await ctx.reply(
                                localeStore.get('dalle.wait', { prompt }),
                                {
                                    reply_to_message_id: ctx.message?.message_id,
                                    disable_notification: true,
                                    parse_mode: 'HTML',
                                },
                            )

                            break
                        }

                        case DalleStatus.UnderLoad: {
                            info('Dalle service is under load')

                            await ctx.reply(localeStore.get('dalle.underLoad'), {
                                reply_to_message_id: ctx.message?.message_id,
                                disable_notification: true,
                            })

                            break
                        }

                        case DalleStatus.Images: {
                            // const joined = await joinImages(output.images)
                            // TODO: join images

                            await ctx.replyWithPhoto(new InputFile(output.images.at(0)!.bytes()), {
                                reply_to_message_id: ctx.message?.message_id,
                            })

                            break
                        }
                    }
                }

                if (exists(messageToDelete)) {
                    await ctx.api.deleteMessage(
                        messageToDelete.chat.id,
                        messageToDelete.message_id,
                    )
                }
            } catch (error) {
                await ctx.reply(localeStore.get('dalle.errors.unknown'), {
                    reply_to_message_id: ctx.message?.message_id,
                    disable_notification: true,
                })
                throw error
            }
        })

        return bot
    }
