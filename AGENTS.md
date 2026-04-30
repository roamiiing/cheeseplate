# Agent Notes

## Telemetry

This bot emits Rosstat telemetry through `src/telemetry.ts`.

- Business events use project `cheeseplate`.
- Raw Telegram events use project `cheeseplate-raw-tg`.
- The telemetry endpoint is hardcoded to `http://rosstat:80/events` by default.
- `TELEMETRY_DISABLED=true` disables all telemetry.
- Events are buffered in memory, flushed as arrays, and dropped on flush failure.
- Bot code should enqueue telemetry with `void telemetry.track(...)` or `telemetry.track(...)`; it must not block bot behavior on telemetry delivery.
