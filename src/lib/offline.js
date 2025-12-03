// Simple localStorage-based offline helpers
export function saveToLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

export function loadFromLocal(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    return null;
  }
}

export async function fetchAndCache(key, fetcher) {
  // fetcher is an async function that returns data from network
  const cached = loadFromLocal(key);

  if (typeof navigator !== "undefined" && navigator.onLine) {
    try {
      const data = await fetcher();
      saveToLocal(key, data);
      return data;
    } catch (err) {
      // fallback to cache if available
      if (cached !== null) return cached;
      throw err;
    }
  }

  if (cached !== null) return cached;
  throw new Error("Offline and no cached data available");
}

export function onOnline(cb) {
  if (typeof window !== "undefined") window.addEventListener("online", cb);
}

export function isOnline() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}
