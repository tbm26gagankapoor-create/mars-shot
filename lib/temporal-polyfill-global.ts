// Register temporal-polyfill on globalThis so libraries like Schedule-X
// that look for the native Temporal API can find it.
import { Temporal } from "temporal-polyfill";

if (typeof (globalThis as Record<string, unknown>).Temporal === "undefined") {
  (globalThis as Record<string, unknown>).Temporal = Temporal;
}
