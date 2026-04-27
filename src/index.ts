import "dotenv/config";
import { createBot } from "./bot";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is required");

const bot = createBot(token);
console.log("Cheeseplate bot started in long polling mode");
bot.start();
