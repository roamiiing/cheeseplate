import { z } from "zod";
import { pick, pickWeighted, type Random } from "../random";
import { commandArgs, escapeHtml, gcd, splitChoices } from "../text";
import { randomReplicas, replica } from "./replicas";
import type { Reply } from "./types";

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

export function roll(random: Random, text: string): Reply {
  const message = commandArgs(text);
  const prob = Math.round(random() * 100);
  if (!message) return { text: `${prob}%` };
  const divider = gcd(prob, 100);
  const fraction = `${prob / divider} случаев из ${100 / divider}`;
  return { text: replica(random, randomReplicas.roll, { message: escapeHtml(message), prob, fraction }) };
}

export function pickChoice(random: Random, text: string): Reply {
  const parsed = pickSchema.safeParse(splitChoices(commandArgs(text)));
  if (!parsed.success) return { text: parsed.error.issues[0]!.message };
  return { text: replica(random, randomReplicas.pick, { choice: escapeHtml(pick(parsed.data, random)) }) };
}

export function ben(random: Random): Reply {
  return { gif: pickWeighted(benGifs, [0.47, 0.47, 0.02, 0.02, 0.02], random) };
}
