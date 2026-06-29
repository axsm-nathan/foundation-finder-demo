/**
 * Returns a debounced wrapper that fires callback after waitMs of inactivity.
 * Trailing-edge only — the last call in a burst fires after the window.
 *
 * design.md §6.6
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  callback: T,
  waitMs: number,
): T {
  let timerId: ReturnType<typeof setTimeout> | undefined

  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      callback.apply(this, args)
    }, waitMs)
  } as T
}
