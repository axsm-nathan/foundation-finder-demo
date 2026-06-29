/**
 * Reusable focus trap for modal dialogs.
 * Used by DisclaimerModal (escapeDeactivates: false) and ExternalLinkModal.
 *
 * design.md §10.1
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface FocusTrapOptions {
  container: HTMLElement
  escapeDeactivates?: boolean
  onDeactivate?: () => void
}

export function activateFocusTrap(options: FocusTrapOptions): () => void {
  const { container, escapeDeactivates = true, onDeactivate } = options

  function getFocusable(): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => !el.closest('[hidden]') && getComputedStyle(el).display !== 'none',
    )
  }

  function handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (escapeDeactivates) {
        e.preventDefault()
        deactivate()
        onDeactivate?.()
      }
      return
    }

    if (e.key !== 'Tab') return

    const focusable = getFocusable()
    if (focusable.length === 0) {
      e.preventDefault()
      return
    }

    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  // Move focus into the container immediately
  const focusable = getFocusable()
  if (focusable.length > 0) {
    focusable[0]!.focus()
  }

  document.addEventListener('keydown', handleKeyDown)

  function deactivate(): void {
    document.removeEventListener('keydown', handleKeyDown)
  }

  return deactivate
}
