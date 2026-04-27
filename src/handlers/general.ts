import { escapeHtml } from "../text";
import type { Reply } from "./types";

export const commands = [
  { command: "settag", description: "Установить себе тег", example: "/settag amogus" },
  { command: "deltag", description: "Снять с себя тег", example: "/deltag amogus" },
  { command: "dryping", description: "Посмотреть пользователей с указанными тегами", example: "/dryping abobus amogus" },
  { command: "about", description: "Посмотреть инфу о пользователе", example: "/about abobus" },
  { command: "setname", description: "Переименоваться", example: "/setname aboba" },
  { command: "taglist", description: "Посмотреть все теги на сервере" },
  { command: "roll", description: "Наванговать" },
  { command: "ben", description: "Hohoho. No." },
  { command: "pick", description: "Выбрать один из предложенных вариантов", example: "/pick amogus, aboba" },
  { command: "__debug", description: "Показать техническую информацию" },
];

export function help(): Reply {
  return {
    text: commands
      .map((item) => `/${item.command} - ${item.description}${item.example ? `\n<pre>${escapeHtml(item.example)}</pre>` : ""}`)
      .join("\n\n"),
  };
}

export function debug(startedAt: number, chatId: number, chatType: string, dbPath: string, proxyMode: string): Reply {
  const memory = process.memoryUsage();
  const uptime = Math.round((Date.now() - startedAt) / 1000);
  return {
    text: [
      `chat id: <code>${chatId}</code>`,
      `chat type: <code>${escapeHtml(chatType)}</code>`,
      `uptime: <code>${uptime}s</code>`,
      `rss: <code>${Math.round(memory.rss / 1024 / 1024)} MB</code>`,
      `sqlite: <code>${escapeHtml(dbPath)}</code>`,
      `proxy: <code>${escapeHtml(proxyMode)}</code>`,
    ].join("\n"),
  };
}
