import { Context, deunionize } from 'telegraf'
import { MessageEntity } from 'telegraf/typings/core/types/typegram'
import { UseCaseContext, Entity, EntityType } from '@/libs/shared/workflow'

const mapEntity =
  (ctx: Context) =>
  (v: MessageEntity): Entity => {
    console.log(v)
    switch (v.type) {
      case 'mention': {
        const username = deunionize(ctx.message)!.text?.substring(
          // strip one because of @
          v.offset + 1,
          v.offset + v.length,
        )

        return {
          type: EntityType.Mention,
          username: username!,
        }
      }
      case 'text_mention': {
        return {
          type: EntityType.TextMention,
          userId: BigInt(v.user.id),
        }
      }
      default: {
        return {
          type: EntityType.Unsupported,
        }
      }
    }
  }

export const mapContext =
  <Input>(ctx: Context) =>
  (input: Input): UseCaseContext<Input> => {
    return {
      userInfo: {
        userId: BigInt(ctx.message!.from.id),
        displayName: ctx.message!.from.username ?? ctx.message!.from.first_name,
      },
      chatInfo: {
        chatId: BigInt(ctx.message!.chat.id),
      },
      messageInfo: {
        entities: (deunionize(ctx.message)?.entities ?? []).map(mapEntity(ctx)),
        repliedMessageInfo: deunionize(ctx.message)!.reply_to_message && {
          userInfo: {
            userId: BigInt(deunionize(ctx.message)!.reply_to_message!.from!.id),
            displayName:
              deunionize(ctx.message)!.reply_to_message!.from!.username ??
              deunionize(ctx.message)!.reply_to_message!.from!.first_name,
          },
        },
      },
      input,
    }
  }
