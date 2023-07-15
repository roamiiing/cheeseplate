import { Bot, InputFile } from 'grammy'
import { Message } from 'grammy_types'
import { info } from 'std/log/mod.ts'
import { LocaleStoreInjection } from 'shared/locales'
import { parseCliArgs, stripFirst } from 'shared/strings'
import { exists } from 'shared/guards'
import { mapLocalizedZodError } from 'shared/validation'
import { KandinskyInput } from 'misc/domain'
import { KandinskyStatus, KandinskyUseCaseInjection } from 'misc/application'

type KandinskyHandlerDeps =
    & LocaleStoreInjection
    & KandinskyUseCaseInjection
    & KandinskyUseCaseInjection

export type RegisterKandinskyHandler = (bot: Bot) => Bot

const CMD_LINE_ARG = ['s', 'style']

export const registerKandinskyHandler =
    ({ localeStore, kandinskyUseCase }: KandinskyHandlerDeps): RegisterKandinskyHandler => (bot: Bot) => {
        bot.command(['kandinsky', 'k'], async (ctx) => {
            const strippedMessage = stripFirst(ctx.message?.text ?? '')

            const args = parseCliArgs(strippedMessage)
            const style = args.getByAliases(...CMD_LINE_ARG)?.toString().toLocaleLowerCase()

            const validatedInput = await KandinskyInput.safeParseAsync({
                prompt: args.head,
                style,
            })

            if (!validatedInput.success) {
                return await ctx.reply(
                    mapLocalizedZodError(localeStore)(validatedInput.error),
                    {
                        reply_to_message_id: ctx.message?.message_id,
                        parse_mode: 'HTML',
                    },
                )
            }

            const input = validatedInput.data

            let messageToDelete: Message | null = null

            try {
                for await (const output of kandinskyUseCase(input)) {
                    switch (output.status) {
                        case KandinskyStatus.Wait: {
                            messageToDelete = await ctx.reply(
                                localeStore.get('kandinsky.wait', { prompt: input.prompt }),
                                {
                                    reply_to_message_id: ctx.message?.message_id,
                                    disable_notification: true,
                                    parse_mode: 'HTML',
                                },
                            )

                            break
                        }

                        case KandinskyStatus.UnderLoad: {
                            info('Kandinsky service is under load')

                            await ctx.reply(localeStore.get('kandinsky.underLoad'), {
                                reply_to_message_id: ctx.message?.message_id,
                                disable_notification: true,
                                parse_mode: 'HTML',
                            })

                            break
                        }

                        case KandinskyStatus.Images: {
                            await ctx.replyWithPhoto(new InputFile(output.images.at(0)!.bytes()), {
                                reply_to_message_id: ctx.message?.message_id,
                            })

                            break
                        }
                    }
                }
            } catch (error) {
                await ctx.reply(localeStore.get('kandinsky.errors.unknown'), {
                    reply_to_message_id: ctx.message?.message_id,
                    disable_notification: true,
                })
                throw error
            } finally {
                if (exists(messageToDelete)) {
                    await ctx.api.deleteMessage(
                        messageToDelete.chat.id,
                        messageToDelete.message_id,
                    )
                }
            }
        })

        return bot
    }
