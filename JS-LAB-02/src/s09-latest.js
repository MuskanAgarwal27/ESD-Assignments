// Section 09 — Out-of-order responses

// Returns a function `track(promise)`. Every call to track gets a number;
// only the MOST RECENT call's result counts.
export function createLatestOnly() {
  let latestId = 0;

  return async function track(promise) {
    const currentId = ++latestId;

    try {
      const value = await promise;

      if (currentId !== latestId) {
        return { stale: true };
      }

      return { stale: false, value };
    } catch (error) {
      if (currentId !== latestId) {
        return { stale: true };
      }

      throw error;
    }
  };
}

// STRETCH — debounce(fn, ms): returns a function that waits until it has NOT
// been called for `ms` milliseconds, then calls fn once, with the LAST arguments.
export function debounce(fn, ms) {
  let timer;

  return function (...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, ms);
  };
}
