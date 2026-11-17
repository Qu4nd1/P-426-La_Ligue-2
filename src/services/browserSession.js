const browserIdKey = "la-ligue:browser-id";

export function createBrowserId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function getBrowserId() {
  return withBrowserLock(browserIdKey, () => {
    const savedId = localStorage.getItem(browserIdKey);
    if (savedId) return savedId;

    const id = createBrowserId();
    localStorage.setItem(browserIdKey, id);
    return id;
  });
}

export function withBrowserLock(key, action) {
  return navigator.locks ? navigator.locks.request(key, action) : action();
}
