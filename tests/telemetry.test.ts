import { expect, test } from "bun:test";
import { createRawTelegramTransformer, createTelemetry } from "../src/telemetry";

test("telemetry buffers events and sends arrays", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const telemetry = createTelemetry({
    project: "cheeseplate",
    endpoint: "http://rosstat/events",
    batchSize: 2,
    flushIntervalMs: 0,
    now: () => new Date("2026-04-30T01:02:03.000Z"),
    fetch: async (url, init) => {
      calls.push({ url: String(url), init: init! });
      return new Response("{}", { status: 202 });
    },
  });

  telemetry.track("one", { ok: true });
  expect(calls).toHaveLength(0);
  telemetry.track("two", { value: 2 });
  await telemetry.flush();

  expect(calls).toHaveLength(1);
  expect(calls[0]!.url).toBe("http://rosstat/events");
  expect(JSON.parse(String(calls[0]!.init.body))).toEqual([
    { project: "cheeseplate", event_name: "one", event_data: { ok: true }, timestamp: "2026-04-30T01:02:03.000Z" },
    { project: "cheeseplate", event_name: "two", event_data: { value: 2 }, timestamp: "2026-04-30T01:02:03.000Z" },
  ]);
});

test("telemetry flush failures are logged and dropped", async () => {
  const errors: unknown[] = [];
  const telemetry = createTelemetry({
    project: "cheeseplate",
    flushIntervalMs: 0,
    fetch: async () => {
      throw new Error("network down");
    },
    logger: { error: (...args: unknown[]) => errors.push(args) },
  });

  telemetry.track("failing");
  await expect(telemetry.flush()).resolves.toBeUndefined();
  await telemetry.flush();

  expect(errors).toHaveLength(1);
});

test("disabled telemetry skips fetch", async () => {
  let calls = 0;
  const telemetry = createTelemetry({
    project: "cheeseplate",
    disabled: true,
    fetch: async () => {
      calls += 1;
      return new Response("{}", { status: 202 });
    },
  });

  telemetry.track("ignored");
  await telemetry.flush();

  expect(calls).toBe(0);
});

test("raw Telegram transformer preserves response and records errors", async () => {
  const events: Array<{ name: string; data?: Record<string, unknown>; project?: string }> = [];
  const telemetry = {
    track: (name: string, data?: Record<string, unknown>, project?: string) => events.push({ name, data, project }),
    flush: async () => {},
    stop: () => {},
  };
  const transformer = createRawTelegramTransformer(telemetry, "cheeseplate-raw-tg");
  const response = { ok: true, result: true } as const;

  const result = await (transformer as any)(async () => response, "deleteMessage", { chat_id: 1, message_id: 2 });

  expect(result).toBe(response);
  expect(events.map((event) => event.name)).toEqual(["telegram_api_request", "telegram_api_response"]);
  expect(events.every((event) => event.project === "cheeseplate-raw-tg")).toBe(true);

  await expect((transformer as any)(async () => { throw new Error("telegram failed"); }, "deleteMessage", { chat_id: 1, message_id: 2 })).rejects.toThrow("telegram failed");
  expect(events.at(-1)!.name).toBe("telegram_api_error");
});
