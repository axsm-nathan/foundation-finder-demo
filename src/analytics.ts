/**
 * Thin adapter around window.dataLayer (Google Tag Manager).
 * All errors are swallowed — analytics must never surface to users.
 *
 * design.md §9
 */

type AnalyticsPayload = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

export function trackEvent(eventName: string, payload?: AnalyticsPayload): void {
  try {
    if (!Array.isArray(window.dataLayer)) return
    window.dataLayer.push({ event: eventName, ...payload })
  } catch {
    // silently discard — design.md §9.1 Req 10.8
  }
}
