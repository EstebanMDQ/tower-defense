/**
 * Screen Wake Lock: keeps the phone from sleeping while playing. Supported on
 * Android Chrome and iOS Safari 16.4+. Degrades silently where unavailable.
 */
let sentinel: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<void> {
  if (!("wakeLock" in navigator)) return;
  try {
    sentinel = await navigator.wakeLock.request("screen");
    sentinel.addEventListener("release", () => {
      sentinel = null;
    });
  } catch {
    // Denied or blocked (e.g. low battery) - ignore.
  }
}

/**
 * Re-acquire the lock when the page becomes visible again: the browser releases
 * it automatically when the tab is backgrounded or the device locks.
 */
export function initWakeLock(): void {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && sentinel === null) {
      void requestWakeLock();
    }
  });
}
