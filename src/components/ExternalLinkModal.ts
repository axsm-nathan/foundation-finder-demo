import { activateFocusTrap } from '../focusTrap'
import { trackEvent } from '../analytics'

export interface ExternalLinkModalProps {
  targetUrl: string
  triggerEl: HTMLElement
  onConfirm: (url: string) => void
  onCancel: () => void
}

export function ExternalLinkModal(props: ExternalLinkModalProps): HTMLElement {
  const overlay = document.createElement('div')
  overlay.className = 'ff-modal'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-labelledby', 'ff-ext-link-title')

  const dialog = document.createElement('div')
  dialog.className = 'ff-modal__dialog'

  const title = document.createElement('h2')
  title.id = 'ff-ext-link-title'
  title.className = 'ff-modal__title'
  title.textContent = 'Leaving This Website'

  const body = document.createElement('p')
  body.className = 'ff-modal__body'
  body.textContent =
    'You are leaving this website and visiting a third-party website not affiliated with Axsome. Axsome is not responsible for the content of third-party websites.'

  const footer = document.createElement('div')
  footer.className = 'ff-modal__footer ff-modal__footer--row'

  const cancelBtn = document.createElement('button')
  cancelBtn.type = 'button'
  cancelBtn.className = 'ff-btn'
  cancelBtn.textContent = 'Cancel'

  const continueBtn = document.createElement('button')
  continueBtn.type = 'button'
  continueBtn.className = 'ff-btn ff-btn--primary'
  continueBtn.textContent = 'Continue'

  footer.appendChild(cancelBtn)
  footer.appendChild(continueBtn)
  dialog.appendChild(title)
  dialog.appendChild(body)
  dialog.appendChild(footer)
  overlay.appendChild(dialog)

  const deactivate = activateFocusTrap({
    container: dialog,
    escapeDeactivates: true,
    onDeactivate: cancel,
  })

  function cancel(): void {
    deactivate()
    overlay.remove()
    props.triggerEl.focus()
    props.onCancel()
  }

  function confirm(): void {
    deactivate()
    overlay.remove()
    trackEvent('external_navigation_confirmed', { target_url: props.targetUrl })
    try {
      window.open(props.targetUrl, '_blank', 'noopener,noreferrer')
    } catch {
      // silently ignore if blocked by browser
    }
    props.onConfirm(props.targetUrl)
  }

  cancelBtn.addEventListener('click', cancel)
  continueBtn.addEventListener('click', confirm)

  return overlay
}
