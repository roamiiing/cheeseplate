import { z } from "zod";
import { pick, pickWeighted, type Random } from "../random";
import { commandArgs, escapeHtml, gcd, splitChoices } from "../text";
import { randomReplicas, replica } from "./replicas";
import { replyResult, type HandlerResult } from "./types";

const pickSchema = z
  .array(z.string().min(1).max(50))
  .min(2, "Укажите <b>как минимум 2</b> выбора. Выборы разделяйте либо запятыми, либо начинайте каждый выбор с новой строки")
  .max(50);

const benGifs = [
  "https://c.tenor.com/eW6zRrKEuIYAAAAC/yes-ben.gif",
  "https://c.tenor.com/DW_G9zcpdF4AAAAC/ben.gif",
  "https://c.tenor.com/Cziub06OwxgAAAAC/ben.gif",
  "https://c.tenor.com/Vh28wO-oya4AAAAC/ugh-ben.gif",
  "https://c.tenor.com/hdPVLfpe81cAAAAC/talking-ben-drinking.gif",
];

export function roll(random: Random, text: string, chatId: number, fromId: number): HandlerResult {
  const message = commandArgs(text);
  const prob = Math.round(random() * 100);
  const event = {
    name: "roll_requested",
    data: { fromId, chatId, question: message, hasQuestion: Boolean(message), questionLength: message.length, probability: prob },
  };
  if (!message) return replyResult({ text: `${prob}%` }, [event]);
  const divider = gcd(prob, 100);
  const fraction = `${prob / divider} случаев из ${100 / divider}`;
  return replyResult({ text: replica(random, randomReplicas.roll, { message: escapeHtml(message), prob, fraction }) }, [event]);
}

export function pickChoice(random: Random, text: string, chatId: number, fromId: number): HandlerResult {
  const choices = splitChoices(commandArgs(text));
  const parsed = pickSchema.safeParse(choices);
  if (!parsed.success) {
    return replyResult({ text: parsed.error.issues[0]!.message }, [
      { name: "pick_requested", data: { fromId, chatId, valid: false, choices, choiceCount: choices.length, rejectedReason: parsed.error.issues[0]!.message, selectedChoice: null, selectedIndex: null } },
    ]);
  }
  const selectedChoice = pick(parsed.data, random);
  return replyResult({ text: replica(random, randomReplicas.pick, { choice: escapeHtml(selectedChoice) }) }, [
    { name: "pick_requested", data: { fromId, chatId, valid: true, choices: parsed.data, choiceCount: parsed.data.length, rejectedReason: null, selectedChoice, selectedIndex: parsed.data.indexOf(selectedChoice) } },
  ]);
}

export function ben(random: Random, chatId: number, fromId: number): HandlerResult {
  const gif = pickWeighted(benGifs, [0.47, 0.47, 0.02, 0.02, 0.02], random);
  return replyResult({ gif }, [{ name: "ben_requested", data: { fromId, chatId, gif, gifIndex: benGifs.indexOf(gif) } }]);
}
