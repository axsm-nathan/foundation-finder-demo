/**
 * ARIA live region announcer and responsive breakpoint observer.
 *
 * design.md §10.2, §11.1
 */

let politeEl: HTMLElement | null = null
let assertiveEl: HTMLElement | null = null
let clearTimerId: ReturnType<typeof setTimeout> | undefined

function ensureLiveRegions(): void {
  if (politeEl) return

  politeEl = document.createElement('div')
  politeEl.id = 'ff-live-polite'
  politeEl.setAttribute('aria-live', 'polite')
  politeEl.setAttribute('aria-atomic', 'true')
  politeEl.className = 'ff-sr-only'

  assertiveEl = document.createElement('div')
  assertiveEl.id = 'ff-live-assertive'
  assertiveEl.setAttribute('aria-live', 'assertive')
  assertiveEl.setAttribute('aria-atomic', 'true')
  assertiveEl.className = 'ff-sr-only'

  document.body.appendChild(politeEl)
  document.body.appendChild(assertiveEl)
}

export function announce(message: string, priority: 'polite' | 'assertive'): void {
  ensureLiveRegions()

  clearTimeout(clearTimerId)

  const target = priority === 'assertive' ? assertiveEl! : politeEl!
  // Clear first so re-announcements of the same text are picked up by AT
  target.textContent = ''
  requestAnimationFrame(() => {
    target.textContent = message
    clearTimerId = setTimeout(() => {
      target.textContent = ''
    }, 3000)
  })
}

export function observeBreakpoint(rootEl: HTMLElement): void {
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const width = entry.contentRect.width
      rootEl.classList.toggle('ff-root--mobile', width < 768)
    }
  })
  observer.observe(rootEl)
  // Apply immediately on mount
  rootEl.classList.toggle('ff-root--mobile', rootEl.clientWidth < 768)
}
