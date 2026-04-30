import type { RawApi, Transformer } from "grammy";

export type TelemetryEventData = Record<string, unknown>;

type TelemetryEvent = {
  project: string;
  event_name: string;
  event_data: TelemetryEventData;
  timestamp: string;
};

type TelemetryFetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export type Telemetry = {
  track(eventName: string, eventData?: TelemetryEventData, project?: string): void;
  flush(): Promise<void>;
  stop(): void;
};

type Timer = ReturnType<typeof setInterval>;

export function createTelemetry(input: {
  project: string;
  endpoint?: string;
  batchSize?: number;
  flushIntervalMs?: number;
  disabled?: boolean;
  fetch?: TelemetryFetch;
  now?: () => Date;
  logger?: Pick<Console, "error">;
  setInterval?: typeof setInterval;
  clearInterval?: typeof clearInterval;
}): Telemetry {
  const disabled = input.disabled ?? process.env.TELEMETRY_DISABLED === "true";
  if (disabled) return disabledTelemetry;

  const endpoint = input.endpoint ?? "http://rosstat:80/events";
  const batchSize = input.batchSize ?? 50;
  const flushIntervalMs = input.flushIntervalMs ?? 1000;
  const fetchImpl = input.fetch ?? fetch;
  const now = input.now ?? (() => new Date());
  const logger = input.logger ?? console;
  const setIntervalImpl = input.setInterval ?? setInterval;
  const clearIntervalImpl = input.clearInterval ?? clearInterval;
  const queue: TelemetryEvent[] = [];
  let flushing = false;

  const flush = async () => {
    if (flushing || queue.length === 0) return;
    flushing = true;
    const batch = queue.splice(0, batchSize);
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      });
      if (!response.ok) {
        logger.error("Telemetry flush failed", { status: response.status, statusText: response.statusText });
      }
    } catch (error) {
      logger.error("Telemetry flush failed", error);
    } finally {
      flushing = false;
    }
  };

  const timer: Timer | undefined = flushIntervalMs > 0 ? setIntervalImpl(() => void flush(), flushIntervalMs) : undefined;
  timer?.unref?.();

  return {
    track(eventName, eventData = {}, project = input.project) {
      queue.push({
        project,
        event_name: eventName,
        event_data: eventData,
        timestamp: now().toISOString(),
      });
      if (queue.length >= batchSize) void flush();
    },
    flush,
    stop() {
      if (timer) clearIntervalImpl(timer);
    },
  };
}

const disabledTelemetry: Telemetry = {
  track() {},
  async flush() {},
  stop() {},
};

export function createRawTelegramTransformer(telemetry: Telemetry, rawProject: string): Transformer<RawApi> {
  return async (prev, method, payload, signal) => {
    telemetry.track("telegram_api_request", { method, payload }, rawProject);
    try {
      const response = await prev(method, payload, signal);
      telemetry.track("telegram_api_response", { method, response }, rawProject);
      return response;
    } catch (error) {
      telemetry.track("telegram_api_error", { method, payload, error: serializeError(error) }, rawProject);
      throw error;
    }
  };
}

export function trackIncomingUpdate(telemetry: Telemetry, rawProject: string, update: unknown) {
  telemetry.track("telegram_update", { update }, rawProject);
}

function serializeError(error: unknown) {
  if (error instanceof Error) return { name: error.name, message: error.message, stack: error.stack, ...Object.fromEntries(Object.entries(error)) };
  return { value: String(error) };
}
