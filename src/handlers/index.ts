import type { Random } from "../random";
import type { CheeseRepository } from "../repository";
import { debug, help } from "./general";
import { ben, pickChoice, roll } from "./random";
import { deleteTag, dryPing, pingFromMessage, setTag, tagList } from "./tags";
import { about, setName } from "./users";

export type { BusinessTelemetryEvent, HandlerResult, MessageInput, Reply } from "./types";

export function createCheeseHandlers(repo: CheeseRepository, random: Random = Math.random, startedAt = Date.now()) {
  return {
    setTag: (text: string, chatId: number, fromId: number) => setTag(repo, random, text, chatId, fromId),
    deleteTag: (text: string, chatId: number, fromId: number) => deleteTag(repo, random, text, chatId, fromId),
    dryPing: (text: string, chatId: number) => dryPing(repo, random, text, chatId),
    pingFromMessage: (input: Parameters<typeof pingFromMessage>[2]) => pingFromMessage(repo, random, input),
    tagList: (chatId: number) => tagList(repo, chatId),
    setName: (text: string, chatId: number, fromId: number) => setName(repo, random, text, chatId, fromId),
    about: (input: Parameters<typeof about>[2]) => about(repo, random, input),
    roll: (text: string, chatId: number, fromId: number) => roll(random, text, chatId, fromId),
    pick: (text: string, chatId: number, fromId: number) => pickChoice(random, text, chatId, fromId),
    ben: (chatId: number, fromId: number) => ben(random, chatId, fromId),
    help,
    debug: (chatId: number, fromId: number, chatType: string, dbPath: string, proxyMode: string) => debug(startedAt, chatId, fromId, chatType, dbPath, proxyMode),
  };
}
