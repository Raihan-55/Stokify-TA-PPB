/**
 * Enhanced offline helper with smart caching and stale-while-revalidate pattern
 * Supports: cache-first, network-first, stale-while-revalidate strategies
 */

const SESSION_KEY = "stokify_session";
const USER_KEY = "stokify_user";
const CACHE_TIMESTAMP_KEY = "_timestamp";
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

// Cache strategy options
export const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first", // Return cache immediately, update in background
  NETWORK_FIRST: "network-first", // Try network, fallback to cache if failed
  STALE_WHILE_REVALIDATE: "stale-while-revalidate", // Return cache, update in background
};

/**
 * Fetch with smart caching
 * @param {string} key - Cache key
 * @param {Function} fetcher - Async function to fetch data
 * @param {Object} options - { strategy, staleTime, forceRefresh }
 */
export async function fetchWithCache(key, fetcher, options = {}) {
  const { strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE, staleTime = DEFAULT_STALE_TIME, forceRefresh = false } = options;

  const cached = loadFromLocal(key);
  const isStale = cached && Date.now() - cached[CACHE_TIMESTAMP_KEY] > staleTime;
  const isOnlineStatus = isOnline();

  // STRATEGY: CACHE_FIRST
  if (strategy === CACHE_STRATEGIES.CACHE_FIRST && cached && !forceRefresh) {
    // Return cache immediately, update in background if online
    if (isOnlineStatus && isStale) {
      fetcher().then((data) => saveToLocal(key, data)).catch(() => {});
    }
    return cached.data;
  }

  // STRATEGY: NETWORK_FIRST or STALE_WHILE_REVALIDATE (default)
  if (isOnlineStatus && !forceRefresh) {
    try {
      const data = await fetcher();
      saveToLocal(key, data);
      return data;
    } catch (err) {
      if (cached) return cached.data;
      throw err;
    }
  }

  // Offline or error
  if (cached) return cached.data;
  throw new Error("Offline and no cached data available");
}

/**
 * Batch fetch multiple resources in parallel
 * Useful for loading multiple tables at once
 */
export async function batchFetch(queries) {
  // queries = { key: { fetcher, options }, ... }
  return Promise.all(
    Object.entries(queries).map(([key, { fetcher, options }]) =>
      fetchWithCache(key, fetcher, options)
        .then((data) => [key, data])
        .catch((err) => [key, null, err])
    )
  ).then((results) => {
    const data = {};
    results.forEach(([key, value, err]) => {
      data[key] = value;
      if (err) console.warn(`Failed to fetch ${key}:`, err);
    });
    return data;
  });
}

/**
 * Prefetch data in the background (no blocking)
 */
export async function prefetch(key, fetcher, options = {}) {
  try {
    await fetchWithCache(key, fetcher, { ...options, forceRefresh: true });
  } catch (e) {
    // Silently fail prefetch
  }
}

/**
 * Clear cache for a key or all cache
 */
export function clearCache(key = null) {
  if (key) {
    localStorage.removeItem(key);
  } else {
    // Clear all cache keys (but keep auth/profil)
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("bahan:") || k.startsWith("produk:") || k.startsWith("keuangan:"));
    keys.forEach((k) => localStorage.removeItem(k));
  }
}

// ===== Original helpers =====

export function saveToLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, [CACHE_TIMESTAMP_KEY]: Date.now() }));
  } catch (e) {
    console.warn("Failed to save to localStorage:", e);
  }
}

export function loadFromLocal(key) {
  try {
    const v = localStorage.getItem(key);
    if (!v) return null;
    const parsed = JSON.parse(v);
    return parsed;
  } catch (e) {
    return null;
  }
}

// Legacy function for backward compatibility
export async function fetchAndCache(key, fetcher) {
  return fetchWithCache(key, fetcher, { strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE });
}

export function onOnline(cb) {
  if (typeof window !== "undefined") window.addEventListener("online", cb);
}

export function isOnline() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function clearSessionFromLocalStorage() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.warn("Failed to clear session from localStorage:", e);
  }
}

export function getSessionFromLocalStorage() {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}
