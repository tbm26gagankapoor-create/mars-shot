// Register temporal-polyfill on globalThis so libraries like Schedule-X
// that look for the native Temporal API can find it.
// Always override — native Temporal may exist but differ from the polyfill,
// causing instanceof checks to fail.
import { Temporal } from "temporal-polyfill";

(globalThis as Record<string, unknown>).Temporal = Temporal;
