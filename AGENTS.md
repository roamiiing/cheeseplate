# Agent Notes

## Telemetry

This bot emits Rosstat telemetry through `src/telemetry.ts`.

- Business events use project `cheeseplate`.
- Raw Telegram events use project `cheeseplate-raw-tg`.
- `ROSSTAT_URL` overrides the endpoint. The default is `http://rosstat/events`.
- `TELEMETRY_DISABLED=true` disables all telemetry.
- Events are buffered in memory, flushed as arrays, and dropped on flush failure.
- Bot code should enqueue telemetry with `void telemetry.track(...)` or `telemetry.track(...)`; it must not block bot behavior on telemetry delivery.
