// IN-LAB TASK — Retry asynchronous operations.

import { wait } from "../src/s03-async.js";

export async function retry(task, attempts, delayMs, { backoff = false } = {}) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;

      // Do not wait after the final failed attempt.
      if (attempt === attempts - 1) {
        throw lastError;
      }

      // Normal delay: 40, 40, 40...
      // Backoff: 30, 60, 120...
      const delay = backoff
        ? delayMs * (2 ** attempt)
        : delayMs;

      await wait(delay);
    }
  }

  throw lastError;
}
