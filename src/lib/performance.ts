/**
 * Performance Monitoring Utilities
 *
 * Tools for measuring and optimizing application performance.
 * Helps identify slow operations and memory leaks during development.
 */

/**
 * Simple performance timer for measuring operation duration
 *
 * @example
 * ```typescript
 * const timer = performanceTimer('fetchTrades');
 * await fetchTrades();
 * timer.end(); // Logs: [Performance] fetchTrades: 234ms
 * ```
 */
export function performanceTimer(label: string) {
  const start = performance.now();

  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      return duration;
    },
    getDuration: () => {
      return performance.now() - start;
    },
  };
}

/**
 * Debounce function to limit how often a function is called
 *
 * @param func - Function to debounce
 * @param waitMs - Milliseconds to wait before calling function
 * @returns Debounced function
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   searchAPI(query);
 * }, 300);
 *
 * // Typing "hello" will only call searchAPI once after 300ms of no typing
 * debouncedSearch('h');
 * debouncedSearch('he');
 * debouncedSearch('hel');
 * debouncedSearch('hell');
 * debouncedSearch('hello');
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, waitMs);
  };
}

/**
 * Throttle function to limit how often a function is called
 *
 * Unlike debounce, throttle ensures the function is called at most once
 * per time period, regardless of how many times it's invoked.
 *
 * @param func - Function to throttle
 * @param limitMs - Minimum milliseconds between calls
 * @returns Throttled function
 *
 * @example
 * ```typescript
 * const throttledScroll = throttle(() => {
 *   console.log('Scroll handler');
 * }, 100);
 *
 * window.addEventListener('scroll', throttledScroll);
 * // Will call at most once every 100ms during scrolling
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastRan: number | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();

    if (lastRan === null || now - lastRan >= limitMs) {
      func(...args);
      lastRan = now;
    } else {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        func(...args);
        lastRan = Date.now();
      }, limitMs - (now - lastRan));
    }
  };
}

/**
 * Memoize function results to avoid expensive recalculations
 *
 * @param func - Pure function to memoize
 * @param maxCacheSize - Maximum number of results to cache (default: 10)
 * @returns Memoized function
 *
 * @example
 * ```typescript
 * const expensiveCalculation = memoize((n: number) => {
 *   console.log('Calculating...');
 *   return n * n;
 * });
 *
 * expensiveCalculation(5); // Logs: "Calculating..." Returns: 25
 * expensiveCalculation(5); // Returns: 25 (from cache, no log)
 * ```
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  func: T,
  maxCacheSize = 10
): T {
  const cache = new Map<string, ReturnType<T>>();
  const cacheOrder: string[] = [];

  return function memoized(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args) as ReturnType<T>;
    cache.set(key, result);
    cacheOrder.push(key);

    // Limit cache size (LRU eviction)
    if (cacheOrder.length > maxCacheSize) {
      const oldestKey = cacheOrder.shift()!;
      cache.delete(oldestKey);
    }

    return result;
  } as T;
}

/**
 * Check if code is running in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Check if code is running in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

/**
 * Log only in development mode
 *
 * @param args - Arguments to log
 *
 * @example
 * ```typescript
 * devLog('Debug info:', user); // Only logs in development
 * ```
 */
export function devLog(...args: unknown[]): void {
  if (isDevelopment()) {
    console.log('[Dev]', ...args);
  }
}

/**
 * Measure React component render time (use in useEffect)
 *
 * @param componentName - Name of the component
 * @returns Cleanup function
 *
 * @example
 * ```typescript
 * useEffect(() => {
 *   return measureRenderTime('MyComponent');
 * }, []);
 * ```
 */
export function measureRenderTime(componentName: string) {
  const start = performance.now();

  return () => {
    const duration = performance.now() - start;
    if (duration > 16) { // Warn if render takes longer than 1 frame (60fps)
      console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`);
    }
  };
}

/**
 * Create a promise that resolves after a delay
 *
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after delay
 *
 * @example
 * ```typescript
 * await sleep(1000); // Wait 1 second
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run multiple promises with a concurrency limit
 *
 * @param tasks - Array of functions that return promises
 * @param concurrency - Maximum number of concurrent tasks
 * @returns Promise that resolves when all tasks complete
 *
 * @example
 * ```typescript
 * const tasks = urls.map(url => () => fetch(url));
 * await promisePool(tasks, 3); // Process 3 requests at a time
 * ```
 */
export async function promisePool<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  const executing = new Set<Promise<void>>();

  for (let i = 0; i < tasks.length; i++) {
    const index = i;
    const p = tasks[index]().then((result) => {
      results[index] = result;
    }).finally(() => {
      executing.delete(p);
    });

    executing.add(p);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}
